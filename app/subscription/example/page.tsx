"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Subscription {
    id: number;
    status: string;
    total: string;
    currency: string;
    billing_period: string;
    billing_interval: string;
    next_payment_date_gmt: string;
    start_date_gmt: string;
    line_items: Array<{
        name: string;
        quantity: number;
        total: string;
        meta_data: Array<{ display_key: string; display_value: string }>;
    }>;
    billing: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    meta_data: Array<{ key: string; value: string }>;
}

export default function SubscriptionsPage() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch("/api/website/subscription/get");
            const data = await response.json();

            console.log(data)

            if (data.success && Array.isArray(data.data)) {
                setSubscriptions(data.data);
            } else if (data.subscriptions && Array.isArray(data.subscriptions)) {
                // Fallback
                setSubscriptions(data.subscriptions);
            } else {
                setSubscriptions([]);
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (subscription: Subscription) => {
        if (!confirm("Are you sure you want to cancel this subscription?")) {
            return;
        }

        // Extract Stripe subscription ID from meta_data
        const stripeSubId = subscription.meta_data.find(
            (meta) => meta.key === "stripe_subscription_id" || meta.key === "_stripe_subscription_id"
        )?.value;

        if (!stripeSubId) {
            setMessage({ type: "error", text: "Stripe subscription ID not found" });
            return;
        }

        // WooCommerce subscription ID is the subscription.id itself
        const wooSubId = subscription.id;

        setCanceling(subscription.id);
        setMessage(null);

        try {
            const response = await fetch("/api/website/subscription/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stripeSubscriptionId: stripeSubId,
                    wooSubscriptionId: wooSubId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: "success",
                    text: data.message || "Subscription will be cancelled at the end of the billing period"
                });
                fetchSubscriptions(); // Refresh the list
            } else {
                setMessage({ type: "error", text: data.error || "Failed to cancel subscription" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred while canceling" });
        } finally {
            setCanceling(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "#28a745";
            case "pending":
                return "#ffc107";
            case "cancelled":
            case "canceled":
                return "#dc3545";
            case "on-hold":
                return "#fd7e14";
            default:
                return "#6c757d";
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <p>Loading subscriptions...</p>
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>No Active Subscriptions</h2>
                <p>You don't have any subscriptions yet.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 30 }}>My Subscriptions</h1>

            {message && (
                <div
                    style={{
                        padding: 15,
                        marginBottom: 20,
                        borderRadius: 8,
                        backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
                        color: message.type === "success" ? "#155724" : "#721c24",
                        border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                    }}
                >
                    {message.text}
                </div>
            )}

            {subscriptions.map((subscription) => (
                <div
                    key={subscription.id}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 24,
                        marginBottom: 24,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 24 }}>Subscription #{subscription.id}</h2>
                            <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                                <span
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: 20,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        backgroundColor: getStatusColor(subscription.status) + "20",
                                        color: getStatusColor(subscription.status),
                                    }}
                                >
                                    {subscription.status.toUpperCase()}
                                </span>
                                <span style={{ fontSize: 14, color: "#666" }}>
                                    Started: {formatDate(subscription.start_date_gmt)}
                                </span>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 32, fontWeight: 700, color: "#333" }}>
                                {subscription.currency} {Number(subscription.total).toFixed(2)}
                            </div>
                            <div style={{ fontSize: 14, color: "#666" }}>
                                Every {subscription.billing_interval} {subscription.billing_period}
                                {subscription.billing_interval !== "1" ? "s" : ""}
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Products</h3>
                        {subscription.line_items.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: 16,
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: 8,
                                    marginBottom: 12,
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div>
                                        <strong style={{ fontSize: 16 }}>{item.name}</strong>
                                        <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Quantity: {item.quantity}</div>
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                                        {subscription.currency} {Number(item.total).toFixed(2)}
                                    </div>
                                </div>
                                {item.meta_data && item.meta_data.length > 0 && (
                                    <div style={{ marginTop: 8, fontSize: 14 }}>
                                        {item.meta_data.map((meta, idx) => (
                                            <div key={idx} style={{ color: "#666" }}>
                                                <strong>{meta.display_key}:</strong> {meta.display_value}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Payment Schedule */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Payment Schedule</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div style={{ padding: 12, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
                                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Next Payment</div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>
                                    {formatDate(subscription.next_payment_date_gmt)}
                                </div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
                                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Billing Cycle</div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>
                                    Every {subscription.billing_interval} {subscription.billing_period}
                                    {subscription.billing_interval !== "1" ? "s" : ""}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 12 }}>Billing Address</h3>
                        <div style={{ padding: 16, backgroundColor: "#f8f9fa", borderRadius: 8 }}>
                            <div style={{ marginBottom: 4 }}>
                                {subscription.billing.first_name} {subscription.billing.last_name}
                            </div>
                            <div style={{ marginBottom: 4 }}>{subscription.billing.address_1}</div>
                            <div style={{ marginBottom: 4 }}>
                                {subscription.billing.city}, {subscription.billing.state} {subscription.billing.postcode}
                            </div>
                            <div style={{ marginBottom: 4 }}>{subscription.billing.country}</div>
                            <div style={{ marginTop: 8, color: "#666" }}>
                                <div>Email: {subscription.billing.email}</div>
                                <div>Phone: {subscription.billing.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <a
                            href={`/api/website/invoice/subscription/${subscription.id}`}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#0070f3",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: 8,
                                fontSize: 16,
                                fontWeight: 600,
                                display: "inline-block",
                                textAlign: "center"
                            }}
                        >
                            Download Invoice
                        </a>

                        {subscription.status.toLowerCase() === "active" && (
                            <button
                                onClick={() => handleCancelSubscription(subscription)}
                                disabled={canceling === subscription.id}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: canceling === subscription.id ? "not-allowed" : "pointer",
                                    opacity: canceling === subscription.id ? 0.6 : 1,
                                }}
                            >
                                {canceling === subscription.id ? "Canceling..." : "Cancel Subscription"}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
