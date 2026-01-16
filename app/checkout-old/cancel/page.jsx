"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutCancelContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    return (
        <div style={{ padding: 40, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ color: "#ffc107", marginBottom: 16 }}>Payment Cancelled</h1>
            <p style={{ fontSize: 18, marginBottom: 24, color: "#666" }}>
                Your payment was cancelled. No charges have been made.
            </p>

            {orderId && (
                <div style={{
                    backgroundColor: "#fff3cd",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 24,
                    border: "1px solid #ffc107"
                }}>
                    <div style={{ fontSize: 14, color: "#856404" }}>
                        Order #{orderId} is still pending payment.
                    </div>
                </div>
            )}

            <div style={{ marginTop: 32 }}>
                <p style={{ marginBottom: 16 }}>
                    Your cart items are still saved. You can return to checkout to complete your purchase.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link
                        href="/checkout"
                        style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                        }}
                    >
                        Return to Checkout
                    </Link>
                    <Link
                        href="/cart"
                        style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                        }}
                    >
                        View Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>Loading...</h2>
            </div>
        }>
            <CheckoutCancelContent />
        </Suspense>
    );
}
