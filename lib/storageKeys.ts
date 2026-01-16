// lib/storageKeys.ts
// Centralized helpers for platform-specific storage keys.
// These functions intentionally return hard-coded keys so other modules
// can import them and remain stable when we add other platforms later.

export function getCartKey(): string {
  // Current web storage key for logged-in customer carts
  return "cart:web:v1";
}

export function getWishlistKey(): string {
  // Current web storage key for wishlists
  return "wishlist:web:v1";
}

export default {
  getCartKey,
  getWishlistKey,
};
