"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import { broadcastUpdate, subscribeToRemoteUpdates } from '../lib/realtimeSync';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/website/wishlist/get', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) {
        setItems([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  // useEffect(() => {
  //   const unsub = subscribeToRemoteUpdates((resource, meta) => {
  //     try {
  //       if (resource === 'wishlist') {
  //
  //         fetchWishlist();
  //       }
  //     } catch (e) {
  //
  //     }
  //   });
  //   return () => unsub && unsub();
  // }, [fetchWishlist]);

  const add = useCallback(async (product_id) => {
    try {
      const res = await fetch('/api/website/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      // refresh after server write
      await fetchWishlist();
      // notify other tabs/devices that wishlist changed
      // try { broadcastUpdate('wishlist'); } catch (e) { /* ignore */ }
      return { ok: res.ok, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  }, [fetchWishlist]);

  const remove = useCallback(async (product_id) => {
    try {
      const res = await fetch('/api/website/wishlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      await fetchWishlist();
      // try { broadcastUpdate('wishlist'); } catch (e) { /* ignore */ }
      return { ok: res.ok, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  }, [fetchWishlist]);

  const toggle = useCallback(async (product_id) => {
    const exists = items.find((it) => Number(it.id) === Number(product_id));
    if (exists) return remove(product_id);
    return add(product_id);
  }, [items, add, remove]);

  return (
    <WishlistContext.Provider value={{ items, loading, add, remove, toggle, refresh: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) return { items: [], loading: false, add: async () => { }, remove: async () => { }, toggle: async () => { }, refresh: async () => { } };
  return ctx;
}
