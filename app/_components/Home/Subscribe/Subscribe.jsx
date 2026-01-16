import React from "react";
import styles from "./Subscribe.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";

const Subscribe = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Left}>
            <Image src={one} alt="image" />
          </div>
          <div className={styles.Right}>
            <div className={styles.RightTop}>
              <div className={styles.RightTopContent}>
                <h3>Subscribe and save </h3>
                <p>
                  Your coffee, always on time. Set your preferred delivery
                  schedule and receive freshly roasted coffee at regular
                  intervals. Enjoy added savings, priority roasting, and the
                  confidence of consistent quality in every delivery, so your
                  coffee routine stays effortless and uninterrupted.
                </p>
              </div>
              <div className={styles.RightTopButton}>
                <h4>Explore </h4>
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="29"
                    height="28.6489"
                    stroke="white"
                  />
                  <path
                    d="M21.0674 20.7266H19.0674V12.1366L9.47738 21.7266L8.06738 20.3166L17.6574 10.7266H9.06738V8.72656H21.0674V20.7266Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.RightBottom}>
              <Image src={two} alt="two" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscribe;
