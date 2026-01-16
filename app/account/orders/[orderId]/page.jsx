"use client";
import React, { useEffect, useState } from "react";
import Delivered from "../../_components/Detail/delevery/page";
import DelivereyDetails from "../../_components/Detail/delivery-details/page";
import OrderDetails from "../../_components/Detail/order-details/page";
import Invoice from "../../_components/Detail/invoice/page";
import Cancelled from "../../_components/OrderComponents/Cancelled/page";
import Placed from "../../_components/OrderComponents/Placed/page";
import Progress from "../../_components/OrderComponents/Progress/page";
import styles from "../page.module.css";
import toast from "react-hot-toast";

export default function OrderDetailPage({ params }) {
  const { orderId } = React.use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/website/order/${orderId}`);
        const data = await response.json();

        console.log(data)

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          toast.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  const renderHeader = () => {
    switch (order.status) {
      case 'completed':
        return <Delivered order={order} />;
      case 'cancelled':
      case 'refunded':
      case 'failed':
        return <Cancelled order={order} />;
      case 'processing':
      case 'on-hold':
        return <Placed order={order} />;
      case 'pending':
        return <Progress order={order} />;
      default:
        return <Placed order={order} />;
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {renderHeader()}
        <DelivereyDetails order={order} />
        <OrderDetails order={order} />
        <Invoice order={order} />
      </div>
    </div>
  );
}
