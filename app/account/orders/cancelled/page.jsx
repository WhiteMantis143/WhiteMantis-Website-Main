import React from "react";
import styles from "./page.module.css";
// import Delivered from "../../components/Detail/delevery/pag";
import DelivereyDetails from "../../_components/Detail/delivery-details/page";
import Invoice from "../../_components/Detail/invoice/page";
// import Cancelled from "../../components/Detail/cancellation/page";
// import Refund from "../../components/Detail/Refund/page";
import Cancelled from "../../_components/Detail/cancelled/page";

export default function Deliveres() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div>
          <Cancelled />
        </div>
        <div>
          <h1>Refund Details</h1>
          <div className={styles.refund}>
            <div className={styles.refundTop}>
              <h1>Total refund amount</h1>
              <p>AED 520</p>
            </div>
            <div className={styles.divider}>

            </div>
            <div className={styles.refundBottom}>
              <h1>Added to your Card</h1>
              <div className={styles.visa}>
                <span>
                  <svg
                    width="15"
                    height="12"
                    viewBox="0 0 15 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.373 0H0.908847C0.667806 0 0.436637 0.113461 0.266195 0.315424C0.0957533 0.517386 0 0.791305 0 1.07692V10.9231C0 11.2087 0.0957533 11.4826 0.266195 11.6846C0.436637 11.8865 0.667806 12 0.908847 12H13.373C13.6141 12 13.8452 11.8865 14.0157 11.6846C14.1861 11.4826 14.2819 11.2087 14.2819 10.9231V1.07692C14.2819 0.791305 14.1861 0.517386 14.0157 0.315424C13.8452 0.113461 13.6141 0 13.373 0ZM0.908847 0.923077H13.373C13.4075 0.923077 13.4405 0.939286 13.4648 0.968137C13.4892 0.996989 13.5029 1.03612 13.5029 1.07692V3.07692H0.779012V1.07692C0.779012 1.03612 0.792691 0.996989 0.817039 0.968137C0.841388 0.939286 0.874412 0.923077 0.908847 0.923077ZM13.373 11.0769H0.908847C0.874412 11.0769 0.841388 11.0607 0.817039 11.0319C0.792691 11.003 0.779012 10.9639 0.779012 10.9231V4H13.5029V10.9231C13.5029 10.9639 13.4892 11.003 13.4648 11.0319C13.4405 11.0607 13.4075 11.0769 13.373 11.0769ZM12.2045 9.07692C12.2045 9.19933 12.1635 9.31673 12.0904 9.40328C12.0174 9.48984 11.9183 9.53846 11.815 9.53846H9.73765C9.63434 9.53846 9.53527 9.48984 9.46222 9.40328C9.38918 9.31673 9.34814 9.19933 9.34814 9.07692C9.34814 8.95452 9.38918 8.83712 9.46222 8.75057C9.53527 8.66401 9.63434 8.61539 9.73765 8.61539H11.815C11.9183 8.61539 12.0174 8.66401 12.0904 8.75057C12.1635 8.83712 12.2045 8.95452 12.2045 9.07692ZM8.04979 9.07692C8.04979 9.19933 8.00875 9.31673 7.9357 9.40328C7.86266 9.48984 7.76358 9.53846 7.66028 9.53846H6.6216C6.51829 9.53846 6.41922 9.48984 6.34618 9.40328C6.27313 9.31673 6.23209 9.19933 6.23209 9.07692C6.23209 8.95452 6.27313 8.83712 6.34618 8.75057C6.41922 8.66401 6.51829 8.61539 6.6216 8.61539H7.66028C7.76358 8.61539 7.86266 8.66401 7.9357 8.75057C8.00875 8.83712 8.04979 8.95452 8.04979 9.07692Z"
                      fill="#6E736A"
                    />
                  </svg>
                </span>
                <p>Visa 64xxxxxxxx</p>
              </div>
            </div>
          </div>
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
