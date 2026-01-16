import env from './env';

const WP_BASE = env.WP_URL.replace(/\/$/, '');
const authHeader = 'Basic ' + Buffer.from(`${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`).toString('base64');

function genPassword(len = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { cache: 'no-store', ...(init || {}) });
  const text = await res.text();
  let body: any = text;
  try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
  if (!res.ok) {
    const err = new Error(`Woo API error: ${res.status} ${res.statusText}`);
    // @ts-ignore
    err.status = res.status;
    // @ts-ignore
    err.body = body;
    throw err;
  }
  return body;
}

export async function findCustomerByEmail(email: string) {
  // Normalize email to ensure consistent matching (trim and lowercase)
  const normalizedEmail = email.trim().toLowerCase();
  const url = `${WP_BASE}/wp-json/wc/v3/customers?email=${encodeURIComponent(normalizedEmail)}`;
  const customers = await fetchJson(url, { headers: { Authorization: authHeader } });
  if (Array.isArray(customers) && customers.length) return customers[0];
  return null;
}

export async function createCustomer({ email, first_name, last_name, password }: { email: string; first_name?: string; last_name?: string; password?: string; }) {
  // Normalize email to ensure consistency
  const normalizedEmail = email.trim().toLowerCase();

  const url = `${WP_BASE}/wp-json/wc/v3/customers`;
  // Generate a sensible username from first/last name if possible. Fall back to the
  // email local-part. Strip unsupported characters and ensure a non-empty username.
  let baseUsername = '';
  if (first_name) baseUsername = (first_name || '').trim();
  if (last_name) baseUsername = (baseUsername ? `${baseUsername}.${(last_name || '').trim()}` : (last_name || '').trim());
  if (!baseUsername) baseUsername = (normalizedEmail || '').split('@')[0] || '';
  // normalize: lowercase and allow letters, numbers, dot, underscore and dash
  baseUsername = baseUsername.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (!baseUsername) baseUsername = `user${Math.floor(Math.random() * 9000) + 1000}`;

  const payloadBase = {
    email: normalizedEmail,
    first_name: first_name || '',
    last_name: last_name || '',
    password: password || genPassword(),
  } as any;

  // Try creating customer; if username already exists, retry with a suffix.
  let attempt = 0;
  const maxAttempts = 5;
  while (attempt < maxAttempts) {
    const usernameCandidate = attempt === 0 ? baseUsername : `${baseUsername}${attempt}`;
    const payload = { ...payloadBase, username: usernameCandidate };

    console.log(`🔄 Attempting to create customer (attempt ${attempt + 1}/${maxAttempts}):`, {
      email: normalizedEmail,
      username: usernameCandidate
    });

    try {
      const created = await fetchJson(url, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(`✅ Customer created successfully:`, { email: normalizedEmail, username: usernameCandidate });
      return created;
    } catch (e: any) {
      // If the API error suggests the username is already taken, try another candidate
      const body = e?.body;
      const status = e?.status;

      console.error(`❌ Customer creation failed (attempt ${attempt + 1}):`, {
        email: normalizedEmail,
        username: usernameCandidate,
        status,
        error: body
      });

      const usernameTaken = (body && typeof body === 'object' && (
        (body.code && String(body.code).toLowerCase().includes('existing')) ||
        (body.message && String(body.message).toLowerCase().includes('username'))
      ));
      if (status === 400 || status === 409 || usernameTaken) {
        attempt += 1;
        continue; // retry with new usernameCandidate
      }
      throw e;
    }
  }

  // If all retries failed, throw a generic error
  console.error(`❌ All ${maxAttempts} attempts to create customer failed for:`, normalizedEmail);
  throw new Error('Failed to create customer: username collisions or API error');
}

export async function syncCustomerToWoo(email: string, name?: string, password?: string) {
  if (!email) throw new Error('email is required');
  const existing = await findCustomerByEmail(email);
  if (existing) return existing;

  let first_name = '';
  let last_name = '';
  if (name) {
    const parts = name.trim().split(/\s+/);
    first_name = parts.shift() || '';
    last_name = parts.join(' ');
  }
  const created = await createCustomer({ email, first_name, last_name, password });
  return created;
}

export async function getOrdersByCustomer(wpCustomerId: number, opts: { per_page?: number; page?: number } = {}) {
  if (!wpCustomerId) return [];
  const params: string[] = [];
  params.push(`customer=${encodeURIComponent(String(wpCustomerId))}`);
  if (opts.per_page) params.push(`per_page=${encodeURIComponent(String(opts.per_page))}`);
  if (opts.page) params.push(`page=${encodeURIComponent(String(opts.page))}`);
  const url = `${WP_BASE}/wp-json/wc/v3/orders?${params.join('&')}`;
  const orders = await fetchJson(url, { headers: { Authorization: authHeader } });
  return orders;
}

export async function getCustomerById(wpCustomerId: number) {
  if (!wpCustomerId) return null;
  const url = `${WP_BASE}/wp-json/wc/v3/customers/${wpCustomerId}`;
  const customer = await fetchJson(url, { headers: { Authorization: authHeader } });
  return customer;
}

export async function updateCustomerById(wpCustomerId: number, payload: any) {
  if (!wpCustomerId) throw new Error('wpCustomerId is required');
  const url = `${WP_BASE}/wp-json/wc/v3/customers/${wpCustomerId}`;
  const updated = await fetchJson(url, {
    method: 'PUT',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return updated;
}

export async function uploadImageFromUrl(imageUrl: string, title?: string) {
  if (!imageUrl) return null;

  try {
    // 1. Fetch the image buffer
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to WordPress Media Library
    const filename = `profile-${Date.now()}.jpg`; // standardized name
    const uploadUrl = `${WP_BASE}/wp-json/wp/v2/media`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'image/jpeg', // Assuming JPEG for simplicity from Google, or detected from headers
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      // Try to parse error body for logging
      const errBody = await uploadRes.text();
      console.error("WP Media Upload Failed:", errBody);
      return null;
    }

    const data = await uploadRes.json();

    return {
      id: data.id,
      url: data.source_url,
      name: data.slug,
    };

  } catch (error) {
    console.error("Error uploading image from URL:", error);
    return null;
  }
}

export default {
  syncCustomerToWoo,
  findCustomerByEmail,
  createCustomer,
  getOrdersByCustomer,
  getCustomerById,
  updateCustomerById,
  uploadImageFromUrl,
};

// Product/category helpers
export async function fetchProductCategories({ parent, slug, per_page = 20 }: { parent?: number; slug?: string; per_page?: number } = {}) {
  const params = [] as string[];
  if (typeof parent !== 'undefined' && parent !== null) params.push(`parent=${encodeURIComponent(String(parent))}`);
  if (slug) params.push(`slug=${encodeURIComponent(String(slug))}`);
  params.push(`per_page=${encodeURIComponent(String(per_page))}`);
  const url = `${WP_BASE}/wp-json/wc/v3/products/categories?${params.join('&')}`;
  const cats = await fetchJson(url, { headers: { Authorization: authHeader } });
  return cats;
}

export async function fetchProductsByCategory(categoryId: number | string, { per_page = 24, page = 1 }: { per_page?: number; page?: number } = {}) {
  const params = [] as string[];
  params.push(`per_page=${encodeURIComponent(String(per_page))}`);
  params.push(`page=${encodeURIComponent(String(page))}`);
  if (categoryId) params.push(`category=${encodeURIComponent(String(categoryId))}`);
  const url = `${WP_BASE}/wp-json/wc/v3/products?${params.join('&')}`;
  const prods = await fetchJson(url, { headers: { Authorization: authHeader } });
  return prods;
}

export async function fetchProductTags({ slug, per_page = 100 }: { slug?: string; per_page?: number } = {}) {
  const params = [] as string[];
  if (slug) params.push(`slug=${encodeURIComponent(String(slug))}`);
  params.push(`per_page=${encodeURIComponent(String(per_page))}`);
  const url = `${WP_BASE}/wp-json/wc/v3/products/tags?${params.join('&')}`;
  const tags = await fetchJson(url, { headers: { Authorization: authHeader } });
  return tags;
}

export async function fetchProductsByCategoryAndTag(categoryId: number | string, tagId: number | string, { per_page = 24, page = 1 }: { per_page?: number; page?: number } = {}) {
  const params = [] as string[];
  params.push(`per_page=${encodeURIComponent(String(per_page))}`);
  params.push(`page=${encodeURIComponent(String(page))}`);
  if (categoryId) params.push(`category=${encodeURIComponent(String(categoryId))}`);
  if (tagId) params.push(`tag=${encodeURIComponent(String(tagId))}`);
  const url = `${WP_BASE}/wp-json/wc/v3/products?${params.join('&')}`;
  const prods = await fetchJson(url, { headers: { Authorization: authHeader } });
  return prods;
}

export async function fetchProductById(id: number | string) {
  if (!id) throw new Error('Product ID is required');
  const url = `${WP_BASE}/wp-json/wc/v3/products/${encodeURIComponent(String(id))}`;
  const product = await fetchJson(url, { headers: { Authorization: authHeader } });

  // For variable products, fetch full variation data including meta_data
  if ((product.type === 'variable' || product.type === 'variable-subscription') && Array.isArray(product.variations) && product.variations.length > 0) {
    try {
      // Keep any variation_options provided on the product (some Woo plugins return extra fields there)
      const originalVariationOptions = Array.isArray(product.variation_options) ? product.variation_options : [];
      // Fetch all variations with their meta_data
      const variationPromises = product.variations.map((varId: number) =>
        fetchJson(`${WP_BASE}/wp-json/wc/v3/products/${product.id}/variations/${varId}`, {
          headers: { Authorization: authHeader }
        }).catch(err => {
          console.error(`Failed to fetch variation ${varId}:`, err);
          return null;
        })
      );

      const variationsData = await Promise.all(variationPromises);

      // Map variation data to variation_options format with meta_data included
      product.variation_options = variationsData.filter(v => v !== null).map((variation: any) => ({
        id: variation.id,
        price: Number(variation.price) || 0,
        regular_price: Number(variation.regular_price) || 0,
        sale_price: variation.sale_price ? Number(variation.sale_price) : null,
        price_type: 'base_price',
        in_stock: variation.stock_status === 'instock',
        description: variation.description || '',
        description_source: 'product',
        attributes: variation.attributes.reduce((acc: any, attr: any) => {
          acc[`attribute_${attr.slug}`] = attr.option;
          return acc;
        }, {}),
        image: variation.image?.src || '',
        meta_data: variation.meta_data || [], // IMPORTANT: Include meta_data for subscription info
        // preserve subscription_discount if present on variation endpoint; otherwise try original product.variation_options
        subscription_discount: typeof variation.subscription_discount !== 'undefined' && variation.subscription_discount !== null
          ? variation.subscription_discount
          : (originalVariationOptions.find((ov: any) => Number(ov.id) === Number(variation.id))?.subscription_discount ?? null),
      }));
    } catch (error) {
      console.error('Error fetching variation data:', error);
      // If variation fetching fails, continue with basic product data
    }
  }

  return product;
}
