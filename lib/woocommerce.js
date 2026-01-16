const apiUrl = process.env.WC_API_URL;
const key = process.env.WC_CONSUMER_KEY;
const secret = process.env.WC_CONSUMER_SECRET;

console.log("WooCommerce Config:", { apiUrl, key: key, secret: secret });

if (!apiUrl || !key || !secret) {
  console.warn(
    "WooCommerce env not set: WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET"
  );
}

async function fetchProducts({ per_page = 12, page = 1 } = {}) {
  if (!apiUrl || !key || !secret) {
    throw new Error(
      "Missing WooCommerce environment variables. Check .env.local"
    );
  }

  const base = `${apiUrl.replace(/\/$/, "")}/wp-json/wc/v3`;
  const url = `${base}/products?per_page=${per_page}&page=${page}&consumer_key=${encodeURIComponent(
    key
  )}&consumer_secret=${encodeURIComponent(secret)}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = `Failed fetching products: ${res.status} ${res.statusText} ${text}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data;
}

async function fetchProductById(id) {
  if (!apiUrl || !key || !secret) {
    throw new Error(
      "Missing WooCommerce environment variables. Check .env.local"
    );
  }

  if (!id) {
    throw new Error("Missing product id");
  }

  // Build canonical single-product URL using the WooCommerce REST base
  const baseForSingle = `${apiUrl.replace(/\/$/, "")}/wp-json/wc/v3`;
  const prodUrl = `${baseForSingle}/products/${encodeURIComponent(
    id
  )}?consumer_key=${encodeURIComponent(
    key
  )}&consumer_secret=${encodeURIComponent(secret)}`;

  // Fetch the product using the canonical REST endpoint
  const res = await fetch(prodUrl);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = `Failed fetching product ${id}: ${res.status} ${res.statusText} ${text}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data;
}

export { fetchProducts, fetchProductById };
