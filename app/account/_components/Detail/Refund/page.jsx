"use client";
import React from "react";
import styles from "./page.module.css";

export default function Refund() {
  return (
    <div className={styles.main}>
      <h1>Refund Details</h1>
      <div className={styles.container}>
        <p>
          Once the cancellation is approved, your refund will be initiated to
          the original payment method. Refunds are typically credited within 7
          working days after approval.
        </p>
      </div>
    </div>
  );
}
