import React from "react";
import styles from "./page.module.css";
import Image from "next/image";
// import packet from "./image (16).png";
import Link from "next/link";

export default function Placed({ order }) {
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
          <div className={styles.topLeft}>
            <span>
              <svg
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.78936 17.1077V9.93294L1.50762 6.29531V13.2962C1.50762 13.3476 1.52052 13.3959 1.54631 13.4412C1.57211 13.4862 1.61072 13.5248 1.66215 13.557L7.78936 17.1077ZM9.29697 17.1077L15.4242 13.557C15.4756 13.5248 15.5142 13.4862 15.54 13.4412C15.5658 13.3959 15.5787 13.3476 15.5787 13.2962V6.29531L9.29697 9.93294V17.1077ZM7.63483 18.7525L0.908591 14.8809C0.622479 14.7161 0.399518 14.4958 0.239711 14.2201C0.0799036 13.9442 0 13.6413 0 13.3115V5.68849C0 5.35866 0.0799036 5.0558 0.239711 4.7799C0.399518 4.50418 0.622479 4.28389 0.908591 4.11906L7.63483 0.247501C7.92077 0.0825011 8.22355 0 8.54317 0C8.86278 0 9.16556 0.0825011 9.45151 0.247501L16.1777 4.11906C16.4639 4.28389 16.6868 4.50418 16.8466 4.7799C17.0064 5.0558 17.0863 5.35866 17.0863 5.68849V13.3115C17.0863 13.6413 17.0064 13.9442 16.8466 14.2201C16.6868 14.4958 16.4639 14.7161 16.1777 14.8809L9.45151 18.7525C9.16556 18.9175 8.86278 19 8.54317 19C8.22355 19 7.92077 18.9175 7.63483 18.7525ZM12.4185 6.38426L14.7495 5.04675L8.6977 1.54631C8.64627 1.51415 8.59476 1.49807 8.54317 1.49807C8.49157 1.49807 8.44006 1.51415 8.38864 1.54631L6.20636 2.80266L12.4185 6.38426ZM8.54317 8.63412L10.88 7.28104L4.67361 3.69366L2.33681 5.04675L8.54317 8.63412Z"
                  fill="#1E4B7A"
                />
              </svg>
            </span>
            <div>
              <p>Order Placed</p>
              <p>Placed on {formatDate(order.date_created)}</p>
            </div>
          </div>

          <div className={styles.topRight}>
            <p>
              Order Date: <span>{formatDate(order.date_created)}</span>
            </p>
            <p>
              Order ID: <span>#{order.id}</span>
            </p>
          </div>
        </div>

        <div className={styles.middle}>
          <div className={styles.middleLeft}>
            <p>{order.line_items?.length || 0} Items</p>

            {visibleItems.map((item, idx) => (
              <div className={styles.item} key={idx}>
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

          <div className={styles.middleRight}>
            <Link
              href={`/account/orders/${order.id}`}
              className={styles.orderDetails}
            >
              Order Details
            </Link>
            {/* <button>Cancel Order</button> */} {/* Hide cancel for now until logic passed */}
          </div>
        </div>

        <div className={styles.bottom}>
          <p>Orders can be cancelled until they are shipped.</p>
        </div>
        <div className={styles.OrderMeta}>
          <p>
            Order Date: <span>{formatDate(order.date_created)}</span>
          </p>
          <p>
            Order ID: <span>#{order.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
