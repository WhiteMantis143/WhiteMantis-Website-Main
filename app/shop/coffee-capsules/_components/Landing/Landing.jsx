import React from "react";
import styles from "./Landing.module.css";

const Landing = () => {
  return (
    <section className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.Marquee}>
          <div className={styles.Track}>
            <h3>FROM THE FARM – THROUGH US TO EVERYONE •</h3>
            <h3>FROM THE FARM – THROUGH US TO EVERYONE •</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
