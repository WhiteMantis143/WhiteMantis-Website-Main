import React from "react";
import styles from "./WhyUs.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";
import three from "./3.png";
import four from "./4.png";

const WhyUs = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <h3>Why Choose Us ?</h3>
          </div>
          <div className={styles.Bottom}>
            <div className={styles.Card}>
              <div className={styles.ImageContainer}>
                <Image src={one} alt="Quality Assurance" />
              </div>
              <div className={styles.TextContainer}>
                <h3>Tailored Business Solutions </h3>
                <p>
                  Designing customized coffee programs for every business need
                </p>
              </div>
            </div>
            <div className={styles.Card}>
              <div className={styles.ImageContainer}>
                <Image src={two} alt="Quality Assurance" />
              </div>
              <div className={styles.TextContainer}>
                <h3>Sustainable & Ethical Sourcing </h3>
                <p>
                 Partnering with responsible farmers worldwide.
                </p>
              </div>
            </div>
            <div className={styles.Card}>
              <div className={styles.ImageContainer}>
                <Image src={three} alt="Quality Assurance" />
              </div>
              <div className={styles.TextContainer}>
                <h3>Expert Craftsmanship </h3>
                <p>
                  Years of mastery in roasting and sourcing the finest beans
                </p>
              </div>
            </div>
            <div className={styles.Card}>
              <div className={styles.ImageContainer}>
                <Image src={four} alt="Quality Assurance" />
              </div>
              <div className={styles.TextContainer}>
                <h3>A Legacy of Quality  </h3>
                <p>
                 Building on a strong foundation since 2016
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhyUs;
