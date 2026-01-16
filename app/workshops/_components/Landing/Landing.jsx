"use client";
import React from "react";
import styles from "./Landing.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";

const Landing = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.LeftConatiner}>
            <div className={styles.LeftConatinerTop}>
              <h3>Art & Science of Coffee Mastery</h3>
              <div className={styles.line}></div>
              <p>The White Mantis Roster</p>
            </div>
            <div className={styles.LeftConatinerBottom}>
              <Image src={one} alt="workshop image one" />
            </div>
          </div>
          <div className={styles.MiddleConatiner}>
            <div className={styles.MiddleConatinerTop}>
              <p>
                Join our expert-led sessions to deeply understand coffee
                science, sourcing, and preparation techniques. Perfect your
                palate and brewing skills in a single, immersive experience.
              </p>
            </div>
            <div className={styles.MiddleConatinerBottom}>
                <div className={styles.MiddleConatinerBottomLeft}>
                      <h5>Explore Workshops</h5>
                </div>
              <div
                className={styles.MiddleConatinerBottomRight}
                onClick={() => {
                  const el = document.getElementById("upcoming-workshops");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{ cursor: "pointer" }}
              >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 1H11V9.59L1.41 0L0 1.41L9.59 11H1V13H13V1Z"
                  fill="#6C7A5F"
                />
              </svg>
              </div>
            </div>
          </div>
          <div className={styles.RightConatiner}>
            <Image src={two} alt="workshop image two" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
