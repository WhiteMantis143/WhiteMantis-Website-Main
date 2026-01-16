import React from "react";
import styles from "./Recognitions.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";
import three from "./3.png";
import four from "./4.png";

const Recognitions = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <h3>Recognitions</h3>
          </div>
          <div className={styles.Bottom}>
            <div className={styles.One}>
              <div className={styles.line1}></div>
              <div className={styles.Content}>
                <div className={styles.Text}>
                  <h4>01</h4>
                  <h3>Coaching world barista</h3>
                </div>
                <div className={styles.ImageContainer}>
                  <Image src={one} alt="Recognition 1" />
                </div>
              </div>
            </div>
            <div className={styles.two}>
              <div className={styles.line2}></div>
              <div className={styles.Content}>
                <div className={styles.Text}>
                  <h4>02</h4>
                  <h3>Brewers championship</h3>
                </div>
                <div className={styles.ImageContainer}>
                  <Image src={two} alt="Recognition 1" />
                </div>
              </div>
            </div>
            <div className={styles.three}>
              <div className={styles.line3}></div>
              <div className={styles.Content}>
                <div className={styles.Text}>
                  <h4>03</h4>
                  <h3>Cezve/Ibrik championship</h3>
                </div>
                <div className={styles.ImageContainer}>
                  <Image src={three} alt="Recognition 1" />
                </div>
              </div>
            </div>
            <div className={styles.four}>
              <div className={styles.line4}></div>
              <div className={styles.Content}>
                <div className={styles.Text}>
                  <h4>04</h4>
                  <h3>Roasting championship</h3>
                </div>
                <div className={styles.ImageContainer}>
                  <Image src={four} alt="Recognition 1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Recognitions;
