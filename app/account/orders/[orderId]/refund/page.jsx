import React from "react";

export default function OrderRefundPage({ params }) {
  const { orderId } = params;
  return (
    <div>
      <h1>Order {orderId} — Refund</h1>
      <p>Placeholder refund order details.</p>
    </div>
  );
}
