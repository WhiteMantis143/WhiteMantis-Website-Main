import React from "react";

export default function OrderCancelledPage({ params }) {
  const { orderId } = params;
  return (
    <div>
      <h1>Order {orderId} — Cancelled</h1>
      <p>Placeholder cancelled order details.</p>
    </div>
  );
}
