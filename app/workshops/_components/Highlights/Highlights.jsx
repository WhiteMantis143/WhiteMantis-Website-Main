import React from "react";
import styles from "./Highlights.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";
import three from "./3.png";
import four from "./4.png";

const Highlights = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Heading}>
            <h3>Workshop Highlights</h3>
          </div>

          <div className={styles.BottomContainer}>
            <div className={styles.Left}>
              <div className={styles.imageWrapper}>
                <Image
                  src={one}
                  alt="Highlights Image"
                  className={styles.image}
                />
                <div className={styles.overlay}>
                  <h4>Geisha Workshop Series</h4>
                  <p>October 2024</p>
                </div>
              </div>
            </div>

            <div className={styles.Right}>
              <div className={styles.RightTop}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={two}
                    alt="Highlights Image"
                    className={styles.image}
                  />
                  <div className={styles.overlay}>
                    <h4>Roastery Tour</h4>
                    <p>September 2024</p>
                  </div>
                </div>

                <div className={styles.imageWrapper}>
                  <Image
                    src={three}
                    alt="Highlights Image"
                    className={styles.image}
                  />
                  <div className={styles.overlay}>
                    <h4>Barista Training</h4>
                    <p>August 2024</p>
                  </div>
                </div>
              </div>

              <div className={styles.RightBottom}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={four}
                    alt="Highlights Image"
                    className={styles.image}
                  />
                  <div className={styles.overlay}>
                    <h4>Cupping Session</h4>
                    <p>July 2024</p>
                  </div>
                </div>
              </div>
            </div>
            <button data-newsletter="open">sample</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Highlights;
