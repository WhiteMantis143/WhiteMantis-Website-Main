"use client";
import React from "react";
import styles from "./Landing.module.css";

const Landing = () => {
  return (
    <>
      <div className={styles.Main}>
        <video className={styles.Video} autoPlay muted loop playsInline>
          <source src="/videos/test_about.mp4" type="video/mp4" />
        </video>

        <div className={styles.Overlay}>
          <div className={styles.Marquee}>
            <h2>
              WHERE COFFEE MEETS CRAFT • WHERE COFFEE MEETS CRAFT • WHERE COFFEE
              MEETS CRAFT •
            </h2>
          </div>
          <div className={styles.Content}>
            <div className={styles.BottomText}>
              <p>
                An Emirati-owned specialty coffee brand, originally launched as
                Surge Coffee and Roastery in 2016, the brand has evolved with a
                renewed identity, blending tradition with innovation while
                staying rooted in quality, sustainability, and craftsmanship.
              </p>
            </div>
            <div
              className={styles.Explore}
              onClick={() => {
                document
                  .getElementById("philosophy")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <h4>Explore About Us</h4>
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.5" y="0.5" width="29" height="29" stroke="white" />
                <path
                  d="M21 9H19V17.59L9.41 8L8 9.41L17.59 19H9V21H21V9Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
