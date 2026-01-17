"use client";
import React, { useEffect, useState } from "react";
// import Link from "next/link";
import Progress from "../_components/OrderComponents/Progress/page";
import styles from "./page.module.css";
import Delivered from "../_components/OrderComponents/Delivered/page";
import Placed from "../_components/OrderComponents/Placed/page";
import CancellationRequested from "../_components/OrderComponents/Cancellation/page";
import Cancelled from "../_components/OrderComponents/Cancelled/page";
import InProgress from "../_components/OrderComponents/in-progress/page";


export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/website/order");
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const renderOrderComponent = (order) => {
    // Check for subscription first if needed, or rely on status
    // Example logic based on status
    switch (order.status) {
      case "completed":
        return <Delivered order={order} />;
      case "cancelled":
      case "refunded":
      case "failed":
        return <Cancelled order={order} />;
      case "processing":
      case "on-hold":
        return <Placed order={order} />;
      case "pending":
        return <Progress order={order} />;
      // case "cancellation-requested": // specific custom status?
      //   return <CancellationRequested order={order} />;
      default:
        // Default fallback
        return <Placed order={order} />;
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.Top}>
          <div className={styles.Left}>
            <h1>ALL ORDERS</h1>
          </div>
          <div className={styles.Right}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search in Orders"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.Filter}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.65149 15C6.40016 15 6.18991 14.9153 6.02074 14.746C5.85141 14.5768 5.76674 14.3666 5.76674 14.1152V8.327L0.168743 1.2155C-0.0235907 0.959 -0.0515075 0.692333 0.0849925 0.4155C0.221659 0.1385 0.452159 0 0.776493 0H13.757C14.0813 0 14.3118 0.1385 14.4485 0.4155C14.585 0.692333 14.5571 0.959 14.3647 1.2155L8.76674 8.327V14.1152C8.76674 14.3666 8.68208 14.5768 8.51274 14.746C8.34358 14.9153 8.13333 15 7.88199 15H6.65149ZM7.26674 7.8L12.2167 1.5H2.31674L7.26674 7.8Z"
                  fill="#6E736A"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading orders...</p>
        ) : orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id}>
                {renderOrderComponent(order)}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", padding: "20px" }}>No orders found.</p>
        )}
      </div>
    </div>
  );
}
