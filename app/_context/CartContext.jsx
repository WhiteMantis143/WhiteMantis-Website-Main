"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
// import { broadcastUpdate, subscribeToRemoteUpdates } from "../lib/realtimeSync";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";


const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/website/cart/get", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();

      if (data && data.ok && data.cart) {
        const allItems = [
          ...(data.cart.products || []),
          ...(data.cart.subscription_products || [])
        ].map((it) => ({ ...it }));
        setItems(allItems);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Error fetching cart:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed [loading] dependency

  // initial load
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);



  // subscribe to remote updates and revalidate
  // useEffect(() => {
  //   const unsub = subscribeToRemoteUpdates((resource, meta) => {
  //     try {
  //       if (resource === "cart") fetchCart();
  //     } catch (e) {
  //       /* ignore */
  //     }
  //   });
  //   return () => unsub && unsub();
  // }, [fetchCart]);

  // react to auth changes
  useEffect(() => {
    if (typeof user === "undefined") return; // initial unknown state
    if (user === null) {
      // user logged out: clear cart locally so UI updates immediately
      setItems([]);
    } else {
      // user logged in: refresh cart from server
      fetchCart();
    }
  }, [user, fetchCart]);

  // optimistically update items for better UX
  const addItem = useCallback(async (product_id, quantity = 1, extra = {}) => {
    // console.log("Adding to cart:", { product_id, quantity, ...extra });

    // SNAPSHOT PREVIOUS STATE
    const prevItems = [...items];

    // OPTIMISTIC UPDATE
    let optimisticUpdated = false;
    const newItems = items.map((it) => {
      // Check if this is the item we are updating (match ID and variation)
      const isMatch =
        (String(it.product_id) === String(product_id) || Number(it.product_id) === Number(product_id)) &&
        (String(it.variation_id || 0) === String(extra.variation_id || 0));

      if (isMatch) {
        optimisticUpdated = true;
        const newQty = (it.quantity || 0) + quantity;

        // Create a shallow copy of price to avoid mutating the original reference in prevItems if deep copy wasn't done
        const newPrice = { ...(it.price || {}) };

        // Remove stale server-calculated totals so the client recalculates it
        delete newPrice.product_subtotal;

        return {
          ...it,
          quantity: newQty,
          price: newPrice
        };
      }
      return it;
    });

    // If we found the item and updated it, set state immediately. 
    // If it's a new item, we can't optimistically add it meaningfully without full product data.
    if (optimisticUpdated) {
      setItems(newItems);
    }

    try {
      const res = await fetch("/api/website/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity, ...extra }),
        credentials: "include",
      });
      const data = await res.json();
      if (data && data.ok && data.cart) {
        const allItems = [
          ...(data.cart.products || []),
        ].map((it) => ({ ...it }));
        setItems(allItems);
        // try {
        //   broadcastUpdate("cart");
        // } catch (e) { }

        if (quantity > 0) toast.success("Added to cart!");
        else toast.success("Cart updated");
      } else {
        toast.error(data.error || "Failed to update cart");
        // REVERT
        setItems(prevItems);
      }
      return data;
    } catch (e) {
      toast.error("Network error");
      // REVERT
      setItems(prevItems);
      return { ok: false };
    }
  }, [items]);

  // removeItem optionally accepts variation_id to remove a specific variant
  const removeItem = useCallback(async (product_id, variation_id) => {
    // SNAPSHOT PREVIOUS STATE
    const prevItems = [...items];

    // OPTIMISTIC UPDATE
    const newItems = items.filter(it => {
      const isMatch =
        (String(it.product_id) === String(product_id) || Number(it.product_id) === Number(product_id)) &&
        (String(it.variation_id || 0) === String(variation_id || 0));
      return !isMatch;
    });
    setItems(newItems);

    try {
      const body = {
        product_id: Number(product_id),
      };

      if (typeof variation_id !== "undefined" && variation_id !== null) {
        body.variation_id = Number(variation_id);
      }

      const res = await fetch("/api/website/cart/clear", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data && data.ok && data.cart) {
        const allItems = [
          ...(data.cart.products || []),
          ...(data.cart.subscription_products || [])
        ].map((it) => ({ ...it }));
        setItems(allItems);
        // try {
        //   broadcastUpdate("cart");
        // } catch (e) { }
        toast.success("Item removed");
      } else {
        toast.error(data.error || "Failed to remove item");
        // REVERT
        setItems(prevItems);
      }
      return data;
    } catch (e) {
      toast.error("Network error");
      // REVERT
      setItems(prevItems);
      return { ok: false };
    }
  }, [items]);

  const clearCart = useCallback(async () => {
    try {
      const res = await fetch("/api/website/cart/clear", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "clear" }),
      });

      const data = await res.json();
      if (data && data.ok) {
        setItems([]);
        setAppliedCoupon(null); // Clear coupon too
        // try {
        //   broadcastUpdate("cart");
        // } catch (e) { }
        toast.success("Cart cleared");
      } else {
        toast.error(data.error || "Failed to clear cart");
      }
      return data;
    } catch (e) {
      toast.error("Network error");
      return { ok: false };
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const res = await fetch(`/api/website/cart/coupan/apply?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Invalid coupon");
        return { ok: false, message: data.message };
      }

      setAppliedCoupon(data.coupon);
      // Refetch cart to ensure data is in sync with server
      await fetchCart();
      toast.success("Coupon applied!");
      return { ok: true, coupon: data.coupon };
    } catch (err) {
      toast.error("Failed to apply coupon");
      return { ok: false };
    }
  }, [fetchCart]);

  const removeCoupon = useCallback(async () => {
    try {
      await fetch("/api/website/cart/coupan/remove", {
        method: "GET",
        credentials: "include",
      });
      setAppliedCoupon(null);
      // Refetch cart to ensure data is in sync with server
      await fetchCart();
      toast.success("Coupon removed");
    } catch (err) {
      toast.error("Failed to remove coupon");
    }
  }, [fetchCart]);

  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity || 1);
      const itemSubtotal =
        Number(it.price?.product_subtotal) ||
        Number(it.price?.final_price || it.price || 0) * qty;
      subtotal += itemSubtotal;
    });

    if (appliedCoupon) {
      const amount = Number(appliedCoupon.amount || 0);
      const type = appliedCoupon.discount_type;
      const applyMode =
        appliedCoupon.meta_data?.find(m => m.key === "apply_coupon_to")?.value ||
        appliedCoupon.meta_data?.find(m => m.key === "coupon_apply_to")?.value ||
        "simple";

      if (type === "percent") {
        if (applyMode === "simple") {
          discount = (subtotal * amount) / 100;
        } else if (applyMode === "specific") {
          const targetProducts =
            appliedCoupon.meta_data?.find(m => m.key === "coupan_applied_products")?.value ||
            appliedCoupon.meta_data?.find(m => m.key === "coupon_applied_products")?.value ||
            [];

          // In specific mode, we sum the discount for each qualifying item
          items.forEach(p => {
            if (targetProducts.includes(String(p.product_id)) || targetProducts.includes(Number(p.product_id))) {
              const qty = Number(p.quantity || 1);
              const itemSubtotal = Number(p.price?.product_subtotal) || Number(p.price?.final_price || p.price || 0) * qty;
              discount += (itemSubtotal * amount) / 100;
            }
          });
        }
      } else if (type === "fixed_cart") {
        if (applyMode === "simple") {
          discount = amount;
        } else if (applyMode === "specific") {
          const targetProducts =
            appliedCoupon.meta_data?.find(m => m.key === "coupan_applied_products")?.value ||
            appliedCoupon.meta_data?.find(m => m.key === "coupon_applied_products")?.value ||
            [];

          // Applying FULL amount to EACH unique qualifying product line in the cart
          const qualifyingLines = items.filter(p => targetProducts.includes(String(p.product_id)) || targetProducts.includes(Number(p.product_id)));
          discount = qualifyingLines.length * amount;
        }
      }
    }

    const itemTotals = {};
    items.forEach((it) => {
      const qty = Number(it.quantity || 1);
      const itemSubtotal =
        Number(it.price?.product_subtotal) ||
        Number(it.price?.final_price || it.price || 0) * qty;
      let itemTotal = itemSubtotal;

      if (appliedCoupon) {
        const amount = Number(appliedCoupon.amount || 0);
        const type = appliedCoupon.discount_type;
        const applyMode =
          appliedCoupon.meta_data?.find((m) => m.key === "apply_coupon_to")?.value ||
          appliedCoupon.meta_data?.find((m) => m.key === "coupon_apply_to")?.value ||
          "simple";

        if (type === "percent") {
          if (applyMode === "simple") {
            itemTotal = itemSubtotal * (1 - amount / 100);
          } else if (applyMode === "specific") {
            const targetProducts =
              appliedCoupon.meta_data?.find((m) => m.key === "coupan_applied_products")?.value ||
              appliedCoupon.meta_data?.find((m) => m.key === "coupon_applied_products")?.value ||
              [];
            if (targetProducts.includes(String(it.product_id)) || targetProducts.includes(Number(it.product_id))) {
              itemTotal = itemSubtotal * (1 - amount / 100);
            }
          }
        } else if (type === "fixed_cart") {
          if (applyMode === "simple") {
            if (subtotal > 0) {
              itemTotal = itemSubtotal - (itemSubtotal / subtotal) * amount;
            }
          } else if (applyMode === "specific") {
            const targetProducts =
              appliedCoupon.meta_data?.find((m) => m.key === "coupan_applied_products")?.value ||
              appliedCoupon.meta_data?.find((m) => m.key === "coupon_applied_products")?.value ||
              [];
            if (targetProducts.includes(String(it.product_id)) || targetProducts.includes(Number(it.product_id))) {
              // Now subtracting the full amount from the line total for each qualifying product
              itemTotal = itemSubtotal - amount;
            }
          }
        }
      }

      const key = `${it.product_id}-${it.variation_id || 0}`;
      itemTotals[key] = {
        subtotal: itemSubtotal,
        total: Math.max(itemTotal, 0),
      };
    });

    return {
      subtotal,
      discount: Math.max(discount, 0),
      total: Math.max(subtotal - discount, 0),
      itemTotals,
      couponCode: appliedCoupon?.code || null,
    };
  }, [items, appliedCoupon]);

  return (
    <CartContext.Provider
      value={{
        items,
        products: items.filter(i => !i.subscription_details && !i.subscription), // Derive from items or use separated state if implemented
        subscriptions: items.filter(i => i.subscription_details || i.subscription), // Derive from items
        loading,
        addItem,
        removeItem,
        clearCart,
        refresh: fetchCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartTotals,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx)
    return {
      items: [],
      loading: false,
      addItem: async () => { },
      removeItem: async () => { },
      clearCart: async () => { },
      refresh: async () => { },
    };
  return ctx;
}
