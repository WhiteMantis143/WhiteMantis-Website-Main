"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  // REMOVED <string | null> here for .jsx files
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        localStorage.removeItem("buyNow");
      } catch (e) { }

      // Get order/subscription info from URL params
      const type = searchParams.get("type"); // 'order' or 'subscription'
      const id = orderId || sessionId;

      if (id && type) {
        try {
          // Fetch invoice download URL
          const invoiceUrl = `/api/website/invoice/generate?type=${type}&id=${id}`;
          setDownloadUrl(invoiceUrl);
        } catch (error) {
          console.error("Error setting invoice URL:", error);
        }
      }
      setLoading(false);
    };

    initializePage();
  }, [searchParams, orderId, sessionId]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Processing your order...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h1 style={{ color: "#28a745", marginBottom: 16 }}>Payment Successful!</h1>

      {/* DOWNLOAD BUTTON */}
      {downloadUrl && (
        <div style={{ marginBottom: 32 }}>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              backgroundColor: "#f8f9fa",
              color: "#333",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 600,
              border: "1px solid #dee2e6"
            }}
          >
            <span>📄</span> Download Invoice
          </a>
        </div>
      )}

      {orderId && (
        <div style={{ backgroundColor: "#f8f9fa", padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Order ID</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#333" }}>#{orderId}</div>
        </div>
      )}

      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
        <Link href="/" style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: 6 }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}><h2>Loading...</h2></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}