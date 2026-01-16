import React from "react";
import styles from "./NavigationStrip.module.css";

const NavigationStrip = () => {
  return (
    <div className={styles.main}>
      <div className={styles.MainConatiner}>
        <div className={styles.Top}>
          <div className={styles.MainParentName}>
            <p>Home</p>
          </div>
          <div className={styles.Arrow}>
            <svg
              width="8"
              height="13"
              viewBox="0 0 8 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.946167 12.8717L0 11.9255L5.48967 6.43583L0 0.946167L0.946167 0L7.382 6.43583L0.946167 12.8717Z"
                fill="#6E736A"
              />
            </svg>
          </div>
          <div className={styles.ParentName}>
            <p>Shop</p>
          </div>
          <div className={styles.Arrow}>
            <svg
              width="8"
              height="13"
              viewBox="0 0 8 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.946166 12.8717L0 11.9255L5.48967 6.43583L0 0.946167L0.946166 0L7.382 6.43583L0.946166 12.8717Z"
                fill="#6E736A"
              />
            </svg>
          </div>
          <div className={styles.ActiveName}>
            <p>Coffee Beans</p>
          </div>
        </div>
        <div className={styles.BottomLine}></div>
      </div>
    </div>
  );
};

export default NavigationStrip;
