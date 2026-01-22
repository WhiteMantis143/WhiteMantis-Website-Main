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
  <button className={styles.knowMore}>
    <span>Know more about us</span>

    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.9941 12.1425H10.9951V3.45074L1.40959 13.1543L0.000253677 11.7276L9.58574 2.02405H0.999784V0.000364304H12.9941V12.1425Z"
        fill="#6C7A5F"
      />
    </svg>
  </button>
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
