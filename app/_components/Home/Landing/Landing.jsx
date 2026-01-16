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
             From the farm - through us - to everyone  •  From the farm - through us -  to everyone
            </h2>
          </div>
          <div className={styles.Content}>
            <div className={styles.BottomText}>
              <h4>WHITE MANTIS COFFEE ROASTERS</h4>
              <p>
                An Emirati-owned specialty coffee brand, originally launched as
                Surge Coffee and Roastery in 2016, the brand has evolved with a
                renewed identity, blending tradition with innovation while
                staying rooted in quality, sustainability, and craftsmanship.
              </p>
            </div>
           <div className={styles.RightBottomText}>
            <p>Since 2020 Dubai</p>

           </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
