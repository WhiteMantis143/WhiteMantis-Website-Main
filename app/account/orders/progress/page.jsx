import React from "react";
import styles from "./page.module.css";
// import Delivered from "../../components/Detail/delevery/pag";
import DelivereyDetails from "../../_components/Detail/delivery-details/page";
import OrderDetails from "../../_components/Detail/order-details/page";
import Invoice from "../../_components/Detail/invoice/page";
import Progress from "../../_components/Detail/In-progress/page";

export default function Deliveres() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div>
          <Progress />
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
