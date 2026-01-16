"use client";

import React, { useEffect, useRef } from "react";
import styles from "./OurValues.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const OurValues = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRef = useRef(null);
  const bgNextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 640;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=120%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(
        gridRef.current,
        {
          x: isMobile ? 0 : window.innerWidth * 0.55,
          y: isMobile ? window.innerHeight * 0.55 : window.innerHeight * 0.4,
          ease: "power2.out",
          duration: 1,
        },
        0
      );

      tl.to(
        bgNextRef.current,
        {
          opacity: 1,
          ease: "none",
          duration: 0.6,
        },
        0.2
      );

      tl.call(
        () => {
          const title = cardRef.current.querySelector("h3");
          const text = cardRef.current.querySelector("p");

          if (title.innerText === "OUR VALUES") {
            title.innerText = "OUR VISION";
            text.innerText =
              "Driven by curiosity and guided by purpose, we envision a future where innovation and sustainability work hand in hand.";
          }
        },
        null,
        0.45
      );

      tl.call(
        () => {
          const title = cardRef.current.querySelector("h3");
          const text = cardRef.current.querySelector("p");

          if (tl.scrollTrigger.direction === -1) {
            title.innerText = "OUR VALUES";
            text.innerText =
              "Passion for quality drives our meticulous craft and innovation in coffee defines our search for new techniques. We prioritize community growth through ethical, sustained partnerships.";
          }
        },
        null,
        0.44
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.Main}>
      <div className={styles.BgBase} />
      <div ref={bgNextRef} className={styles.BgNext} />

      <div ref={gridRef} className={styles.Grid}>
        <div className={styles.hTop} />
        <div className={styles.hBottom} />
        <div className={styles.vLeft} />
        <div className={styles.vRight} />

        <div ref={cardRef} className={styles.Card}>
          <h3>OUR VALUES</h3>
          <p>
            Passion for quality drives our meticulous craft and innovation in
            coffee defines our search for new techniques. We prioritize
            community growth through ethical, sustained partnerships.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurValues;
