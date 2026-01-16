"use client";
import React from "react";
import styles from "./MightFit.module.css";

const MightFit = () => {
  const openGmail = () => {
    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1&to=veer@integramagna.com";

    if (typeof window !== "undefined") {
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <h3>Don’t see any job openings that might fit you?</h3>
            <p>
              We are always on a lookout for talented individuals who share our
              vision. Send us an email and tell us why do you want to join the
              White Mantis team.
            </p>
          </div>
          <div className={styles.Bottom}>
            <button type="button" className={styles.Button} onClick={openGmail}>
              Send Email
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MightFit;
