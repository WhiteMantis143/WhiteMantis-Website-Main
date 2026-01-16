"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../_context/CartContext";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    products,
    addItem,
    removeItem,
    clearCart,
    loading,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotals
  } = useCart();

  const [proceeding, setProceeding] = useState(false);
  const [coupon, setCoupon] = useState("");

  // 🏷 Apply coupon using context function
  async function handleApplyCoupon() {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    await applyCoupon(coupon);
  }

  async function handleProceed() {
    if (proceeding) return;
    setProceeding(true);
    try {
      router.push("/checkout");
    } finally {
      setProceeding(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading cart…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Your Cart</h1>

      {/* COUPON INPUT */}
      <div style={{ marginBottom: 10, display: "flex", gap: 10 }}>
        <input
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          style={{
            padding: 8,
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        />
        <button onClick={handleApplyCoupon} style={{ padding: "8px 16px" }}>
          Apply Coupon
        </button>
      </div>

      {/* COUPON DISPLAY */}
      {appliedCoupon && (
        <div style={{ fontSize: 14, color: "green", marginBottom: 15, display: "flex", alignItems: "center", gap: 10 }}>
          <span>Coupon Applied ✅ ({appliedCoupon.code}) — You saved: ₹{cartTotals.discount.toFixed(2)}</span>
          <button
            onClick={removeCoupon}
            style={{ padding: "2px 8px", fontSize: 12, backgroundColor: "#ff4d4f", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            Remove
          </button>
        </div>
      )}

      {/* PRODUCTS LIST */}
      {products && products.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ fontSize: "1.2rem", borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 15 }}>
            Products
          </h2>

          {products.map((it, i) => (
            <div
              key={`prod-${it.product_id}-${it.variation_id || 0}-${i}`}
              style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderBottom: "1px solid #eee", background: "#fff" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div style={{ fontSize: 13, color: "#777" }}>Price: ₹{Number(it.price?.final_price || it.price || 0).toFixed(2)}</div>

                {/* ATTRIBUTES */}
                {it.attributes && Object.keys(it.attributes).length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {Object.entries(it.attributes).map(([key, value]) => (
                      <div key={key} style={{ fontSize: 13, color: "#555" }}>
                        {key.replace(/_/g, " ")}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}

                {/* ITEM TOTAL DISPLAY */}
                {(() => {
                  const itSum = cartTotals.itemTotals[`${it.product_id}-${it.variation_id || 0}`];
                  if (!itSum) return null;
                  const isDiscounted = itSum.total < itSum.subtotal - 0.01;
                  return (
                    <div style={{ marginTop: 8, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>Item Total: </span>
                      {isDiscounted ? (
                        <>
                          <span style={{ textDecoration: "line-through", color: "#999", marginRight: 8 }}>₹{itSum.subtotal.toFixed(2)}</span>
                          <span style={{ color: "green", fontWeight: 700 }}>₹{itSum.total.toFixed(2)}</span>
                        </>
                      ) : (
                        <span>₹{itSum.subtotal.toFixed(2)}</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* QUANTITY */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={async () => {
                    if (it.quantity > 1) {
                      await addItem(it.product_id, -1, { variation_id: it.variation_id });
                    } else {
                      await removeItem(it.product_id, it.variation_id);
                    }
                  }}
                >
                  -
                </button>
                <div>{it.quantity}</div>
                <button onClick={() => addItem(it.product_id, 1, { variation_id: it.variation_id })}>
                  +
                </button>
              </div>

              {/* REMOVE */}
              <button onClick={() => removeItem(it.product_id, it.variation_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CART FOOTER */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <div style={{ fontSize: 16, color: "#666" }}>Subtotal: ₹{cartTotals.subtotal.toFixed(2)}</div>
        {cartTotals.discount > 0 && (
          <div style={{ fontSize: 16, color: "green" }}>Total Savings: -₹{cartTotals.discount.toFixed(2)}</div>
        )}
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>Total: ₹{cartTotals.total.toFixed(2)}</div>

        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={clearCart}>Clear Cart</button>
          <button onClick={handleProceed} disabled={proceeding}>
            {proceeding ? "Proceeding…" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
