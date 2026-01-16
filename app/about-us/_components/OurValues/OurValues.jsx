"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./OurValues.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

const OurValues = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRef = useRef(null);
  const bgNextRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      ScrollTrigger.refresh();
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  useGSAP(
    () => {
      if (!isMobile) {
        // --- DESKTOP ANIMATION ---

        // 1. Capture the initial state
        const state = Flip.getState(cardRef.current);

        // 2. Change the state to the final one
        cardRef.current.classList.remove(styles.CardInitial);
        cardRef.current.classList.add(styles.CardNew);

        // 3. Create the ScrollTrigger-driven timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=120%",
            scrub: 1,
            pin: true,
            markers: false, // Set to true for debugging
          },
        });

        // 4. Create the Flip animation and add it to the timeline
        const flipAnim = Flip.from(state, {
          scale: true,
          duration: 1,
          ease: "power1.inOut",
        });

        tl.add(flipAnim, 0);

        const valuesContent = cardRef.current.querySelector(
          `.${styles.ValuesContent}`
        );
        const visionContent = cardRef.current.querySelector(
          `.${styles.VisionContent}`
        );

        // We want to cross-fade: fade out Values, fade in Vision.
        // Values starts visible (opacity 1), Vision starts invisible (opacity 0 via CSS).

        // Animate Values fading OUT
        tl.to(
          valuesContent,
          {
            opacity: 0,
            duration: 0.1,
          },
          0.45
        );

        // Animate Vision fading IN
        tl.to(
          visionContent,
          {
            opacity: 1,
            duration: 0.1,
          },
          0.45
        );
      } else {
        // --- MOBILE ANIMATION ---

        // 1. Capture the initial state
        const state = Flip.getState(cardRef.current);

        // 2. Change the state to the final one
        cardRef.current.classList.remove(styles.CardInitial);
        cardRef.current.classList.add(styles.CardNew);

        // 3. Create Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
          start: "top top",
    end: "+=35%",          
    scrub: 1,           
    anticipatePin: 1,     
    invalidateOnRefresh: true,
          },
        });

        // 4. Create Flip animation
        const flipAnim = Flip.from(state, {
          scale: true,
          duration: 1,
          ease: "power1.inOut",
        });

        tl.add(flipAnim, 0);

        const valuesContent = cardRef.current.querySelector(
          `.${styles.ValuesContent}`
        );
        const visionContent = cardRef.current.querySelector(
          `.${styles.VisionContent}`
        );

        // Cross-fade opacity synchronized with the flip
        tl.to(valuesContent, { opacity: 0, duration: 0.1 }, 0.45);
        tl.to(visionContent, { opacity: 1, duration: 0.1 }, 0.45);
      }

      return () => {
        if (cardRef.current) {
          cardRef.current.classList.remove(styles.CardNew);
          cardRef.current.classList.add(styles.CardInitial);
          gsap.set(cardRef.current, { clearProps: "all" });

          // Reset content opacity
          const valuesContent = cardRef.current.querySelector(
            `.${styles.ValuesContent}`
          );
          const visionContent = cardRef.current.querySelector(
            `.${styles.VisionContent}`
          );
          if (valuesContent)
            gsap.set(valuesContent, { opacity: 1, clearProps: "all" });
          if (visionContent)
            gsap.set(visionContent, { opacity: 0, clearProps: "all" });
        }
      };
    },
    { dependencies: [isMobile], scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.Main}>
      <div className={styles.BgBase} />
      <div ref={bgNextRef} className={styles.BgNext} />
      <div ref={gridRef} className={styles.Grid}>
        <div
          ref={cardRef}
          className={`${styles.CardBase} ${styles.CardInitial}`}
        >
          <div className={styles.hTop} />
          <div className={styles.hBottom} />
          <div className={styles.vLeft} />
          <div className={styles.vRight} />

          <div className={styles.ContentWrapper}>
            <div className={styles.ValuesContent}>
              <h3>OUR VALUES</h3>
              <p>
                Passion for quality drives our meticulous craft and innovation
                in coffee defines our search for new techniques. We prioritize
                community growth through ethical, sustained partnerships.
              </p>
            </div>
            <div className={styles.VisionContent}>
              <h3>OUR VISION</h3>
              <p>
                Dedicated to selling high-quality coffee and growing together
                with the community. Our vision is to become the most successful
                coffee roastery globally. We ensure ethical practices while
                setting worldwide standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurValues;
