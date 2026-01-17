import React from "react";
import styles from "./TopNavigation.module.css";

const TopNavigation = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <div className={styles.Home}>
              <p>home</p>
            </div>
            <div className={styles.SeparatorSvg}>
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
            <div className={styles.Shop}>
              <p>Shop</p>
            </div>
            <div className={styles.SeparatorSvg}>
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
            <div className={styles.CatName}>
              <p>Coffee Beans</p>
            </div>
            <div className={styles.SeparatorSvg}>
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
            <div className={styles.ProductName}>
              <p>Ethiopia Hamasho</p>
            </div>
          </div>
          <div className={styles.line}></div>
        </div>
      </div>
    </>
  );
};

export default TopNavigation;
