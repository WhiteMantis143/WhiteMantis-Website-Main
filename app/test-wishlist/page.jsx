"use client";
import React, { useState } from "react";

export default function WishlistTestPage() {
    const [response, setResponse] = useState(null);
    const [productId, setProductId] = useState("");
    const [loading, setLoading] = useState(false);

    const clearResponse = () => setResponse(null);

    const handleGet = async () => {
        setLoading(true);
        clearResponse();
        try {
            const res = await fetch("/api/website/wishlist/get");
            const data = await res.json();
            setResponse({ status: res.status, data });
        } catch (error) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!productId) return alert("Enter Product ID");
        setLoading(true);
        clearResponse();
        try {
            const res = await fetch("/api/website/wishlist/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: Number(productId) }),
            });
            const data = await res.json();
            setResponse({ status: res.status, data });
        } catch (error) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!productId) return alert("Enter Product ID");
        setLoading(true);
        clearResponse();
        try {
            const res = await fetch("/api/website/wishlist/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: Number(productId) }),
            });
            const data = await res.json();
            setResponse({ status: res.status, data });
        } catch (error) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Wishlist API Tester</h1>

            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>1. Fetch Wishlist</h3>
                <button
                    onClick={handleGet}
                    disabled={loading}
                    style={{ ...styles.button, backgroundColor: "#2563eb" }}
                >
                    {loading ? "Loading..." : "Get All Wishlist Items"}
                </button>
            </div>

            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>2. Manage Item by ID</h3>
                <div style={styles.row}>
                    <input
                        type="number"
                        placeholder="Product ID (e.g. 123)"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        style={styles.input}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        style={{ ...styles.button, backgroundColor: "#16a34a" }}
                    >
                        Add
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={loading}
                        style={{ ...styles.button, backgroundColor: "#dc2626" }}
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 30 }}>
                <h3 style={styles.sectionTitle}>API Response</h3>
                <div style={styles.responseBox}>
                    {response ? (
                        <pre>{JSON.stringify(response, null, 2)}</pre>
                    ) : (
                        <span style={styles.placeholder}>
                            No response yet...
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---------- Inline Styles ---------- */

const styles = {
    container: {
        padding: 40,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 30,
    },
    card: {
        padding: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        backgroundColor: "#f9fafb",
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 16,
    },
    row: {
        display: "flex",
        gap: 12,
        alignItems: "center",
    },
    button: {
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
    },
    input: {
        border: "1px solid #d1d5db",
        padding: 10,
        borderRadius: 6,
        width: 220,
        outline: "none",
    },
    responseBox: {
        backgroundColor: "#020617",
        color: "#22c55e",
        padding: 16,
        borderRadius: 8,
        minHeight: 200,
        maxHeight: 500,
        overflow: "auto",
        fontFamily: "monospace",
    },
    placeholder: {
        color: "#94a3b8",
        fontStyle: "italic",
    },
};
