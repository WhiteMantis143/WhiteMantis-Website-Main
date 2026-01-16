import React from "react";
import styles from "./OurPhilosophy.module.css";

const OurPhilosophy = () => {
  return (
    <>
      <div className={styles.Main} id="philosophy">
        <div className={styles.MainConatiner}>
          <div className={styles.Left}>
            <h4>Our Philosophy</h4>
          </div>
          <div className={styles.Right}>
            <p>
              At White Mantis, coffee is a quiet balance - between people and
              process, precision and patience, flavor and feeling. It’s not just
              something we brew, but something we live. Every bean carries
              intention, from the farms we partner with to the hands that roast
              and pour. We believe in craft that honors its origin, choices that
              sustain the planet, and experiences that bring people together.
              Because for us, coffee is more than a ritual, it’s a way to slow
              down, connect, and create moments that linger.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OurPhilosophy;
