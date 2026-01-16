"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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

      if (data?.ok && data.cart) {
        const allItems = [
          ...(data.cart.products || []),
          ...(data.cart.subscription_products || []),
        ];
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
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (typeof user === "undefined") return;
    if (user === null) {
      setItems([]);
    } else {
      fetchCart();
    }
  }, [user, fetchCart]);

  // ✅ FIXED addItem (pure optimistic, no overwrite)
  const addItem = useCallback(async (product_id, quantity = 1, extra = {}) => {
    let prevSnapshot;

    setItems((prev) => {
      prevSnapshot = prev;

      return prev.map((it) => {
        const isMatch =
          String(it.product_id) === String(product_id) &&
          String(it.variation_id || 0) === String(extra.variation_id || 0);

        if (!isMatch) return it;

        return {
          ...it,
          quantity: (it.quantity || 0) + quantity,
          price: { ...it.price }, // remove server-calculated subtotal influence
        };
      });
    });

    try {
      const res = await fetch("/api/website/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id, quantity, ...extra }),
      });

      const data = await res.json();

      if (!data?.ok) {
        setItems(prevSnapshot);
        toast.error(data?.error || "Failed to update cart");
        return { ok: false };
      }

      return { ok: true };
    } catch (err) {
      setItems(prevSnapshot);
      toast.error("Network error");
      return { ok: false };
    }
  }, []);

  // ✅ FIXED removeItem (optimistic)
  const removeItem = useCallback(async (product_id, variation_id) => {
    let prevSnapshot;

    setItems((prev) => {
      prevSnapshot = prev;
      return prev.filter(
        (it) =>
          !(
            String(it.product_id) === String(product_id) &&
            String(it.variation_id || 0) === String(variation_id || 0)
          )
      );
    });

    try {
      const res = await fetch("/api/website/cart/clear", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(product_id),
          variation_id: variation_id ? Number(variation_id) : undefined,
        }),
      });

      const data = await res.json();

      if (!data?.ok) {
        setItems(prevSnapshot);
        toast.error(data?.error || "Failed to remove item");
      }

      return data;
    } catch (err) {
      setItems(prevSnapshot);
      toast.error("Network error");
      return { ok: false };
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const res = await fetch(
        `/api/website/cart/coupan/apply?code=${encodeURIComponent(code)}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Invalid coupon");
        return { ok: false };
      }

      setAppliedCoupon(data.coupon);
      toast.success("Coupon applied!");
      return { ok: true };
    } catch {
      toast.error("Failed to apply coupon");
      return { ok: false };
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      await fetch("/api/website/cart/coupan/remove", {
        credentials: "include",
      });
      setAppliedCoupon(null);
      toast.success("Coupon removed");
    } catch {
      toast.error("Failed to remove coupon");
    }
  }, []);

  // ✅ FIXED totals (NO product_subtotal)
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.price?.final_price || it.price || 0);
      subtotal += price * qty;
    });

    if (appliedCoupon) {
      const amount = Number(appliedCoupon.amount || 0);
      if (appliedCoupon.discount_type === "percent") {
        discount = (subtotal * amount) / 100;
      } else if (appliedCoupon.discount_type === "fixed_cart") {
        discount = amount;
      }
    }

    return {
      subtotal,
      discount: Math.max(discount, 0),
      total: Math.max(subtotal - discount, 0),
    };
  }, [items, appliedCoupon]);

  return (
    <CartContext.Provider
      value={{
        items,
        products: items.filter((i) => !i.subscription),
        subscriptions: items.filter((i) => i.subscription),
        loading,
        addItem,
        removeItem,
        refresh: fetchCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartTotals,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
