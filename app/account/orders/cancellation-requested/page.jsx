import React from "react";
import styles from "./page.module.css";
// import Delivered from "../../components/Detail/delevery/pag";
import DelivereyDetails from "../../_components/Detail/delivery-details/page";
import Invoice from "../../_components/Detail/invoice/page";
import Cancellation from "../../_components/Detail/cancellation/page";
import Refund from "../../_components/Detail/Refund/page";

export default function Deliveres() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div>
          <Cancellation />
        </div>
        <div>
          <Refund />
        </div>

        <div>
          <DelivereyDetails />
        </div>
        <div>
          <h1>Order price</h1>
          <div className={styles.Top}>
            <div className={styles.Left}>
              <h1>AED 1520</h1>
              <p>You saved AED 80</p>
            </div>
            <div>
              <svg
                width="21"
                height="14"
                viewBox="0 0 21 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 2.1104L1.86375 0L10.5 9.77919L19.1363 0L21 2.1104L10.5 14L0 2.1104Z"
                  fill="#6E736A"
                />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <Invoice />
        </div>
      </div>
    </div>
  );
}
