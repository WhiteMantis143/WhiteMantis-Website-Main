import { getCustomerById, updateCustomerById } from './woo';
import { getWishlistKey } from './storageKeys';

// Lightweight helpers for wishlist meta stored on Woo customer record.
// These are helpers only and are not wired into API routes by default.
// They intentionally do not change any existing API behavior — they only
// provide a single place to read/write wishlist platform key when needed.

const LEGACY_WISHLIST_KEYS = ['app_wishlist_v1', 'app_wishlist'];

export async function getWishlistForCustomer(wpCustomerId: number) {
  if (!wpCustomerId) return { items: [] };
  const customer = await getCustomerById(wpCustomerId);
  if (!customer || !Array.isArray(customer.meta_data)) return { items: [] };

  // Try new key first
  const newKey = getWishlistKey();
  let meta = customer.meta_data.find((m: any) => m.key === newKey);
  if (meta) return meta.value || { items: [] };

  // Fallback to legacy keys
  for (const k of LEGACY_WISHLIST_KEYS) {
    meta = customer.meta_data.find((m: any) => m.key === k);
    if (meta) return meta.value || { items: [] };
  }

  return { items: [] };
}

export async function setWishlistForCustomer(wpCustomerId: number, wishlist: any) {
  if (!wpCustomerId) throw new Error('wpCustomerId required');
  const payload = { meta_data: [{ key: getWishlistKey(), value: wishlist }] };
  const updated = await updateCustomerById(wpCustomerId, payload);
  return updated;
}

export default { getWishlistForCustomer, setWishlistForCustomer };
