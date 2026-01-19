"use client";

import toast from "react-hot-toast";
import Image from "next/image";

export const addToCartToast = (product, openCart) => {
    toast.custom(
        (t) => {
            // Check if the toast is currently visible
            const isVisible = t.visible;

            return (
                <div
                    style={{
                        position: "relative",
                        width: "380px",
                        maxWidth: "90vw",
                        background: "#ffffff",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",

                        // ANIMATION CORE
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible
                            ? "translateY(0)"
                            : "translateY(-20px) scale(0.95)",
                        transition: "all 400ms cubic-bezier(0.23, 1, 0.32, 1)",

                        willChange: "transform, opacity",
                        pointerEvents: "auto",
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            fontSize: "22px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#aaa",
                            lineHeight: 0.5,
                            transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                    >
                        ×
                    </button>

                    {/* Title */}
                    <h3
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            marginBottom: "16px",
                            color: "#888",
                            textTransform: "uppercase",
                        }}
                    >
                        Added to cart
                    </h3>

                    {/* Product row */}
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                flexShrink: 0,
                                background: "#f9f9f9",
                                borderRadius: "4px",
                                overflow: "hidden",
                                position: "relative",
                                border: "1px solid #eee"
                            }}
                        >
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="64px"
                                style={{ objectFit: "cover" }}
                                priority
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#1a1a1a",
                                    margin: 0,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {product.name}
                            </p>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "#666",
                                    margin: "4px 0 0",
                                }}
                            >
                                Qty: {product.quantity}
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            // Use a small delay for the redirect so the user sees the button click
                            openCart();
                        }}
                        style={{
                            width: "100%",
                            background: "#6b7b5c",
                            color: "#ffffff",
                            padding: "14px",
                            fontSize: "14px",
                            fontWeight: 600,
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "transform 0.1s active, background 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#5a6a4b")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#6b7b5c")}
                    >
                        View Cart
                    </button>
                </div>
            );
        },
        {
            duration: 4000,
            id: "cart-toast",
            position: "top-right",
        }
    );
};