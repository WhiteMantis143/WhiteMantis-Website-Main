"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/website/order");
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setOrders(data.data);
            } else if (data.orders) {
                // Fallback in case API changes
                setOrders(data.orders);
            }

        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (order) => {
        if (!confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
            return;
        }

        // Extract Stripe charge ID from meta_data
        const chargeId = order.meta_data.find(
            (meta) => meta.key === "stripe_charge_id" || meta.key === "_stripe_charge_id"
        )?.value;

        if (!chargeId) {
            toast.error("Cannot cancel: Transaction ID not found");
            return;
        }

        setCanceling(order.id);

        try {
            const response = await fetch("/api/website/order/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    chargeId: chargeId
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Order cancelled and refunded successfully");
                fetchOrders(); // Refresh list
            } else {
                toast.error(data.message || "Failed to cancel order");
            }
        } catch (error) {
            toast.error("An error occurred while canceling");
        } finally {
            setCanceling(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "#28a745";
            case "processing": return "#17a2b8";
            case "pending": return "#ffc107";
            case "cancelled": return "#dc3545";
            case "failed": return "#dc3545";
            default: return "#6c757d";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-AE", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Dubai"
        });
    };

    if (loading) {
        return <div style={{ padding: 40, textAlign: "center" }}>Loading orders...</div>;
    }

    return (
        <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 30 }}>My Orders</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: "center", color: "#666" }}>You have no orders yet.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: 20,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid #eee" }}>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 700 }}>Order #{order.id}</div>
                                    <div style={{ color: "#666", fontSize: 14 }}>{formatDate(order.date_created)}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{
                                        display: "inline-block",
                                        padding: "4px 12px",
                                        borderRadius: 20,
                                        backgroundColor: getStatusColor(order.status),
                                        color: "white",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        marginBottom: 5
                                    }}>
                                        {order.status.toUpperCase()}
                                    </div>
                                    <div style={{ fontWeight: 700 }}>
                                        {order.currency} {Number(order.total).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                {order.line_items.map((item, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 15 }}>
                                        <div>
                                            <strong>{item.quantity}x</strong> {item.name}
                                        </div>
                                        <div>
                                            {order.currency} {Number(item.total).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 15, paddingTop: 15, borderTop: "1px solid #eee" }}>
                                <div style={{ fontSize: 14, color: "#666" }}>
                                    Payment: {order.payment_method_title}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a
                                        href={`/api/website/invoice/order/${order.id}`}
                                        style={{
                                            backgroundColor: "#0070f3",
                                            color: "white",
                                            textDecoration: "none",
                                            padding: "8px 16px",
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            display: "inline-block"
                                        }}
                                    >
                                        Download Invoice
                                    </a>

                                    {order.status === 'completed' && (
                                        <button
                                            onClick={() => handleCancelOrder(order)}
                                            disabled={canceling === order.id}
                                            style={{
                                                backgroundColor: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 16px",
                                                borderRadius: 4,
                                                cursor: canceling === order.id ? "not-allowed" : "pointer",
                                                opacity: canceling === order.id ? 0.7 : 1,
                                                fontSize: 14,
                                                fontWeight: 600
                                            }}
                                        >
                                            {canceling === order.id ? "Cancelling..." : "Cancel Order"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
