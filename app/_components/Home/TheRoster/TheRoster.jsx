"use client";
import React, { useEffect, useState } from "react";
import styles from "./TheRoster.module.css";
import Image from "next/image";
import One from "./1.png";
import Two from "./2.png";
import Three from "./3.png";

import CommunityPopup from "../CommunityPopup/CommunityPopup";




const images = [One, Two, Three];

const TheRoster = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.MainConatiner}>
        <div className={styles.Left}>
          <div className={styles.LeftTop}>
            <h3>Meet the Roaster: Join the Inner Circle</h3>
            <p>
              Beyond the cup, the Inner Circle is your access to exclusive
              knowledge and offers. Join our community to receive new recipes,
              advanced brewing tips and tricks, and limited-time deals directly
              from the White Mantis craft.
            </p>
          </div>
          <div className={styles.LeftBottom}>
            <button
  className={styles.JoinBtn}
  onClick={() => setOpenPopup(true)}
>
  Join Our Community
</button>
          </div>
        </div>

        <div className={styles.Right}>
          {images.map((img, index) => (
            <div
              key={index}
              className={`${styles.imageWrap} ${
                activeIndex === index ? styles.active : styles.inactive
              }`}
            >
              <Image src={img} alt="image" fill />
            </div>
          ))}
        </div>
      </div>
      <CommunityPopup
  isOpen={openPopup}
  onClose={() => setOpenPopup(false)}
/>

    </div>
  );
};

export default TheRoster;
