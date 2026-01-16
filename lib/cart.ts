import env from "./env";
import { getCustomerById, updateCustomerById } from "./woo";
import { getCartKey } from "./storageKeys";

const WP_BASE = env.WP_URL.replace(/\/$/, "");
const authHeader =
  "Basic " +
  Buffer.from(`${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`).toString(
    "base64"
  );

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { cache: "no-store", ...(init || {}) });
  const text = await res.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }
  if (!res.ok) {
    const err: any = new Error(
      `Woo API error: ${res.status} ${res.statusText}`
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// Cart for logged-in users is stored in customer.meta_data under a platform-specific key.
// We introduced a clean web key and keep reading legacy keys for backward compatibility.
const LEGACY_CART_KEYS = ["app_cart_v1", "app_cart"];

function findCartMeta(customer: any) {
  if (!customer || !Array.isArray(customer.meta_data)) return null;

  // 1) Try the new web key first
  const newKey = getCartKey();
  let m = customer.meta_data.find((x: any) => x.key === newKey);
  if (m) return m.value || null;

  // 2) Fallback to legacy keys (preserve existing data)
  for (const k of LEGACY_CART_KEYS) {
    m = customer.meta_data.find((x: any) => x.key === k);
    if (m) return m.value || null;
  }

  return null;
}

export async function getCartForCustomer(wpCustomerId: number) {
  if (!wpCustomerId) return { items: [] };
  const customer = await getCustomerById(wpCustomerId);
  const cart = findCartMeta(customer) || { items: [] };
  return cart;
}

export async function setCartForCustomer(wpCustomerId: number, cart: any) {
  if (!wpCustomerId) throw new Error("wpCustomerId required");
  const payload = { meta_data: [{ key: getCartKey(), value: cart }] };
  const updated = await updateCustomerById(wpCustomerId, payload);
  return updated;
}

export async function fetchOrderById(orderId: number) {
  const url = `${WP_BASE}/wp-json/wc/v3/orders/${encodeURIComponent(
    String(orderId)
  )}`;
  return await fetchJson(url, { headers: { Authorization: authHeader } });
}

export async function createGuestCartOrder(metaToken: string, line_items = []) {
  const url = `${WP_BASE}/wp-json/wc/v3/orders`;
  const payload = {
    status: "pending", // acts as a cart
    line_items,
    meta_data: [{ key: "guest_cart_token", value: metaToken }],
  };
  return await fetchJson(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateGuestCartOrder(
  orderId: number,
  line_items: any[] = []
) {
  const url = `${WP_BASE}/wp-json/wc/v3/orders/${encodeURIComponent(
    String(orderId)
  )}`;

  const sanitizedLineItems = (line_items || []).map((li: any) => {
    const out: any = {
      quantity: Number(li.quantity || 0),
    };

    if (li.id) out.id = Number(li.id); // existing line items must keep their id
    if (li.product_id) out.product_id = Number(li.product_id);
    if (li.variation_id) out.variation_id = Number(li.variation_id);

    // We deliberately DO NOT send total/subtotal/price/etc.
    // WooCommerce will recalculate totals from product prices.
    return out;
  });

  const payload = { line_items: sanitizedLineItems };

  return await fetchJson(url, {
    method: "PUT",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function clearGuestCartOrder(orderId: number) {
  // We simply delete the order to clear cart for guest
  const url = `${WP_BASE}/wp-json/wc/v3/orders/${encodeURIComponent(
    String(orderId)
  )}`;
  return await fetchJson(url, {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });
}

export default {
  getCartForCustomer,
  setCartForCustomer,
  fetchOrderById,
  createGuestCartOrder,
  updateGuestCartOrder,
  clearGuestCartOrder,
};
