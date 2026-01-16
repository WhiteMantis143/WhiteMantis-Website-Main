"use client";
import React from "react";
import styles from "./not-found.module.css";

import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.TextContainer}>
            <h3>
              Oops! <br />
              Brew Went Missing
            </h3>
            <p>
              Looks like the page you’re looking for has taken a coffee break.
              Let’s get you back to something freshly brewed.
            </p>
          </div>
          <div className={styles.CtaContainer}>
            <Link href="/">
            <button className={styles.CtaButton}> Go Back to Homepage </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
