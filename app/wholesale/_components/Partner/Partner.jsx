import React from "react";
import styles from "./Partner.module.css";

const Partner = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainContainer}>
          <div className={styles.Left}>
            <h3>Partner with White Mantis</h3>
          </div>
          <div className={styles.Right}>
            <p>
              At White Mantis, we partner with cafés, restaurants, offices, and
              hospitality businesses that care about quality and thoughtful
              sourcing. For us, wholesale is about more than supplying coffee,
              it’s about building long-term partnerships. For over a decade,
              we’ve been sourcing and roasting coffees with a focus on flavor,
              consistency, and transparency, from standout single origins to
              dependable house blends. We support our partners with training,
              brewing guidance, and equipment advice, helping you get the best
              out of every cup. Whether you’re opening a new space or refining
              your coffee program, we’re here to grow with you.{" "}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partner;
