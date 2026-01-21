"use client";

import React from "react";
import styles from "./Landing.module.css";
import Link from "next/link";

const Landing = () => {
  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.MarqueeWrapper}>
          <div className={styles.Marquee}>
            <span>FROM THE FARM – THROUGH US – TO EVERYONE • </span>
            <span>FROM THE FARM – THROUGH US – TO EVERYONE • </span>
            <span>FROM THE FARM – THROUGH US – TO EVERYONE • </span>
          </div>
        </div>

        <div className={styles.Left}></div>

        <div className={styles.Right}>
          <div className={styles.RightTop}>
            <p>
              Commit to a continuous supply of our specialty, expertly sourced
              coffee. Choose your flavor profile and schedule your delivery for
              ultimate brewing convenience.
            </p>
          </div>

          <div
            className={styles.RightBottom}
            onClick={() => {
              document
                .getElementById("Subscriptions")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <h4>Explore Subscriptions </h4>
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0.5" y="0.5" width="29" height="29" stroke="white" />
              <path
                d="M21.0469 8.85938H19.0469V17.4494L9.45687 7.85938L8.04688 9.26937L17.6369 18.8594H9.04688V20.8594H21.0469V8.85938Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
