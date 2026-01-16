import React from "react";
import styles from "./page.module.css";
import Delivered from "../../_components/Detail/delevery/page";
import DelivereyDetails from "../../_components/Detail/delivery-details/page";
import OrderDetails from "../../_components/Detail/order-details/page";
import Invoice from "../../_components/Detail/invoice/page";

export default function Deliveres() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div>
          <Delivered />
        </div>

        <div>
          <DelivereyDetails />
        </div>
        <div>
          <OrderDetails />
        </div>
        <div>
          <Invoice />
        </div>
      </div>
    </div>
  );
}
