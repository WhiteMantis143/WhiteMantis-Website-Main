"use client";
import React, { useState } from "react";
import styles from "./FaqSection.module.css";

const FAQS = [
  {
    q: "Can I Customize My Grind Size?",
    a: "Yes — you can choose the grind size when you set up your subscription and change it later from your profile or subscription settings.",
  },
  {
    q: "Can I Skip A Delivery Or Change My Grind Size After I Subscribe?",
    a: "Absolutely — manage deliveries or pause shipments from your account dashboard. Changes take effect for subsequent deliveries.",
  },
  {
    q: "How Does Billing Work, And Can I Cancel My Subscription Easily?",
    a: "Billing runs on the schedule you choose. You can cancel anytime from your account. Cancellations apply from the next billing date.",
  },
  {
    q: "Are Drip Bags And Capsules Available In All Three Subscription Tiers?",
    a: "Yes — drip bags and capsules are available depending on the tier and options you choose during sign-up.",
  },
  {
    q: "How Fresh Is The Coffee, And How Long Does Delivery Take?",
    a: "We roast to order and ship quickly — delivery time varies by location but is typically within a few business days.",
  },
];

const PlusIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask
      id="mask0_4278_1304"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="24"
      height="24"
    >
      <rect width="24" height="24" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_4278_1304)">
      <path d="M11 21V13H3V11H11V3H13V11H21V13H13V21H11Z" fill="#6E736A" />
    </g>
  </svg>
);
const MinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <rect x="0" y="8" width="18" height="2" fill="#525252" />
  </svg>
);

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (index) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section className={styles.section}>
      <div className={styles.bgWrap} />

      <div className={styles.center}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <h3>FREQUENTLY ASKED QUESTIONS</h3>
          </div>

          <div className={styles.list}>
            {FAQS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div className={styles.row} key={i}>
                  <div className={styles.index}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className={styles.content}>
                    <div className={styles.top}>
                      <button
                        className={styles.question}
                        onClick={() => toggle(i)}
                      >
                        <span className={styles.qtext}>{item.q}</span>
                      </button>

                      <button
                        className={styles.iconBtn}
                        onClick={() => toggle(i)}
                      >
                        {isOpen ? <MinusIcon /> : <PlusIcon />}
                      </button>
                    </div>

                    <div
                      className={`${styles.answer} ${isOpen ? styles.open : ""}`}
                    >
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
