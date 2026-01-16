"use client";
import React from "react";
import styles from "./page.module.css";
// import Link from "next/link"; // Use a tag for download

export default function Invoice({ order }) {
  if (!order) return null;

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h1>Get invoice for your shipment </h1>
        <a href={`/api/website/invoice/order/${order.id}`} target="_blank" rel="noopener noreferrer">
          <button style={{ cursor: 'pointer' }}>Download Invoice</button>
        </a>
      </div>
    </div>
  );
}
