import React from "react";
import styles from "./Community.module.css";
import Image from "next/image";
import Link from "next/link";
import one from "./1.png";

const Community = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <div className={styles.TopLeft}>
              <h3>
                Built on Craft,
                <br /> Driven by Community
              </h3>
            </div>
            <div className={styles.TopRight}>
              <p>
                A specialty coffee roastery rooted in ethical sourcing and
                expert roasting, crafted to grow alongside the community it
                serves. Working with coffee lovers, cafés, restaurants, and
                brands, the focus is on delivering reliable, thoughtfully
                tailored coffee solutions. From direct trade relationships at
                origin to precise, data-driven roasting, every step is
                intentional and transparent, ensuring consistent quality and
                refined flavor in every batch. Beyond roasting, the emphasis
                remains on long-term partnerships that elevate everyday coffee
                rituals and support confident business growth.
              </p>
              <Link href="/about-us">
                <button className={styles.knowMore}>Know more about us</button>
              </Link>
            </div>
          </div>
          <div className={styles.Bottom}>
            <Image src={one} alt="whitemantis" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;
