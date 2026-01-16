import React from "react";
import styles from "./Roster.module.css";
import Image from "next/image";
import One from "./1.png";
import Two from "./2.png";
import Three from "./3.png";

const Roster = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.left}>
            <div className={styles.LeftTop}>
              <h3>Meet the Roster: Join the Inner Circle</h3>
              <p>
                Beyond the cup, the Inner Circle is your access to exclusive
                knowledge and offers. Join our community to receive new recipes,
                advanced brewing tips and tricks, and limited-time deals
                directly from the White Mantis craft.
              </p>
            </div>
            <div data-newsletter="open" className={styles.LeftBottom}>
              <p>Join Our Community</p>
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12.798"
                  cy="12.7997"
                  r="12.798"
                  transform="rotate(-180 12.798 12.7997)"
                  fill="white"
                />
                <g clipPath="url(#clip0_944_5663)">
                  <path
                    d="M7.04808 12.7753L18.4241 12.7753M18.4241 12.7753L13.3049 17.8945M18.4241 12.7753L13.3049 7.65616"
                    stroke="#6C7A5F"
                    strokeWidth="1.6"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_944_5663">
                    <rect
                      width="13.6512"
                      height="13.6512"
                      fill="white"
                      transform="matrix(-1 0 0 -1 19.5647 19.5977)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.RightOne}>
        <div className={styles.imageContainer}>
          <Image src={One} alt="Roster Image" className={styles.image} />
          <div className={styles.caption}>The Barista's Touch</div>
        </div>

            </div>
            <div className={styles.RightTwo}>
        <div className={styles.imageContainer}>
          <Image src={Two} alt="Roster Image" className={styles.image} />
          <div className={styles.caption}>Advanced Cupping Sessions</div>
        </div>

            </div>
            <div className={styles.RightThree}>
        <div className={styles.imageContainer}>
          <Image src={Three} alt="Roster Image" className={styles.image} />
          <div className={styles.caption}>Inner Circle Exclusives</div>
        </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Roster;
