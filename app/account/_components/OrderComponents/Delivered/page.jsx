import React from "react";
import styles from "./page.module.css";
// import packet from "./image (16).png"; // Use dynamic images
import Image from "next/image";
import Link from "next/link";

export default function Delivered({ order }) {
  if (!order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dubai",
    });
  };

  const visibleItems = order.line_items?.slice(0, 2) || [];
  const remainingCount = Math.max(0, (order.line_items?.length || 0) - 2);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.left}>
            <span>
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.50175 19C8.18775 19 6.95267 18.7507 5.7965 18.252C4.64033 17.7533 3.63467 17.0766 2.7795 16.2218C1.92433 15.3669 1.24725 14.3617 0.74825 13.206C0.249417 12.0503 0 10.8156 0 9.50175C0 8.18775 0.249417 6.95267 0.74825 5.7965C1.24692 4.64033 1.92375 3.63467 2.77875 2.7795C3.63375 1.92433 4.63917 1.24725 5.795 0.74825C6.95083 0.249417 8.18583 0 9.5 0C10.5533 0 11.55 0.158333 12.49 0.475C13.43 0.791667 14.2923 1.23333 15.077 1.8L13.9923 2.90975C13.3461 2.46475 12.6462 2.11858 11.8925 1.87125C11.1388 1.62375 10.3413 1.5 9.5 1.5C7.28333 1.5 5.39583 2.27917 3.8375 3.8375C2.27917 5.39583 1.5 7.28333 1.5 9.5C1.5 11.7167 2.27917 13.6042 3.8375 15.1625C5.39583 16.7208 7.28333 17.5 9.5 17.5C11.7167 17.5 13.6042 16.7208 15.1625 15.1625C16.7208 13.6042 17.5 11.7167 17.5 9.5C17.5 9.14867 17.4769 8.80125 17.4307 8.45775C17.3846 8.11425 17.3153 7.78025 17.223 7.45575L18.4345 6.23475C18.6178 6.74875 18.7579 7.27758 18.8547 7.82125C18.9516 8.36475 19 8.92433 19 9.5C19 10.8142 18.7507 12.0492 18.252 13.205C17.7533 14.3608 17.0766 15.3663 16.2218 16.2213C15.3669 17.0763 14.3617 17.7531 13.206 18.2518C12.0503 18.7506 10.8156 19 9.50175 19ZM8.08075 13.7538L4.177 9.85L5.23075 8.79625L8.08075 11.6463L17.9462 1.7655L19 2.81925L8.08075 13.7538Z"
                  fill="#428B54"
                />
              </svg>
            </span>
            <div>
              <p>Delivered</p>
              <p>on {formatDate(order.date_completed || order.date_created)}</p>
            </div>
          </div>

          <div className={styles.right}>
            <p>
              Order Date: <span>{formatDate(order.date_created)}</span>
            </p>
            <p>
              Order ID: <span>#{order.id}</span>
            </p>
          </div>
        </div>

        <div className={styles.middle}>
          <div className={styles.left}>
            <p>{order.line_items?.length || 0} Items</p>

            {visibleItems.map((item, idx) => (
              <div key={idx}>
                <Image
                  src={item.image?.src || "https://placehold.co/100x100"}
                  alt={item.name}
                  width={50}
                  height={50}
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <p>{item.name}</p>
                  <p>{item.meta_data?.find(m => m.key === "pa_weight")?.value || ""}</p>
                </div>
              </div>
            ))}

            {remainingCount > 0 && (
              <p style={{ color: "#2F362A" }}>+ {remainingCount} more</p>
            )}
          </div>

          <div className={styles.right}>
            <Link
              href={`/account/orders/${order.id}`}
              className={styles.orderDetails}
            >
              Order Details
            </Link>
          </div>
        </div>
        <div className={styles.OrderMeta}>
          <p>
            Order Date: <span>{formatDate(order.date_created)}</span>
          </p>
          <p>
            Order ID: <span>#{order.id}</span>
          </p>
        </div>

        <div className={styles.bottom}></div>
      </div>
    </div>
  );
}
