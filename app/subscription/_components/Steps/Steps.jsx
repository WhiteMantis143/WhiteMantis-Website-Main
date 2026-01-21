"use client";
import React, { useLayoutEffect, useRef } from "react";

import styles from "./Steps.module.css";
import TopImage1 from "./1.png";
import TopImage2 from "./2.png";
import TopImage3 from "./3.png";
import TopImage4 from "./4.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const imgs = [TopImage1, TopImage2, TopImage3, TopImage4];

export default function Steps() {
  const rootRef = useRef(null);
  const imgARef = useRef(null);
  const imgBRef = useRef(null);
  const baselineRef = useRef(null);
  const activeLineRef = useRef(null);

  const centersRef = useRef([]);
  const baselineWidthRef = useRef(0);
  let isMounted = true;

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const isMobile = () => window.matchMedia("(max-width: 1240px)").matches;
    const DOT_RADIUS = 8;
    const DOT_RADIUS_MOBILE = 7;

    let onResize;
    let onRefreshInit;
    let st;

    const ctx = gsap.context(() => {
      const getStepEls = () => Array.from(root.querySelectorAll("[data-step]"));
      const getDotEls = () => Array.from(root.querySelectorAll("[data-dot]"));

      const computeCenters = () => {
        if (!baselineRef.current) return;

        const dots = getDotEls();

        if (isMobile()) {
          const steps = getStepEls();

          const firstStepRect = steps[0].getBoundingClientRect();
          const firstTop = firstStepRect.top + window.scrollY;

          centersRef.current = steps.map((step) => {
            const h3 = step.querySelector("h3");
            const r = h3.getBoundingClientRect();
            return (
              r.top +
              window.scrollY -
              firstTop +
              r.height / 2 -
              (isMobile() ? DOT_RADIUS_MOBILE : DOT_RADIUS)
            );
          });

          const lastStepRect = steps[steps.length - 1].getBoundingClientRect();
          baselineWidthRef.current =
            lastStepRect.bottom + window.scrollY - firstTop;
        } else {
          const baselineRect = baselineRef.current.getBoundingClientRect();
          const baselineLeft = baselineRect.left + window.scrollX;
          const baselineWidth = baselineRect.width;
          baselineWidthRef.current = baselineWidth;

          centersRef.current = dots.map((d) => {
            const r = d.getBoundingClientRect();
            const center = r.left + window.scrollX + r.width / 2;
            return Math.max(0, Math.min(baselineWidth, center - baselineLeft));
          });
        }
      };

      const initVisuals = () => {
        computeCenters();
        const steps = getStepEls();
        const dots = getDotEls();

        if (imgARef.current) {
          imgARef.current.src = imgs[0].src ?? imgs[0];
          imgARef.current.dataset.current = "0";
        }
        if (imgBRef.current) {
          imgBRef.current.src = imgs[1] ? (imgs[1].src ?? imgs[1]) : imgs[0];
          imgBRef.current.dataset.current = "1";
        }

        gsap.set(imgARef.current, { autoAlpha: 1 });
        gsap.set(imgBRef.current, { autoAlpha: 0 });

        steps.forEach((s, i) => gsap.set(s, { opacity: i === 0 ? 1 : 0.35 }));
        dots.forEach((d, i) =>
          gsap.set(d, {
            opacity: i === 0 ? 1 : 0.45,
            scale: i === 0 ? 1.15 : 1,
          }),
        );
        if (isMobile()) {
          dots.forEach((dot, i) => {
            gsap.set(dot, {
              top: centersRef.current[i],
            });
          });
        }

        const dotOffset = isMobile() ? DOT_RADIUS_MOBILE : DOT_RADIUS;
        const firstPx = (centersRef.current[0] ?? 0) + dotOffset;

        if (isMobile()) {
          gsap.set(activeLineRef.current, {
            height: `${Math.max(8, firstPx)}px`,
          });
        } else {
          gsap.set(activeLineRef.current, {
            width: `${Math.max(8, firstPx)}px`,
          });
        }
      };

      const lerp = (a, b, t) => a + (b - a) * t;

      const updateFromProgress = (progress) => {
        const n = imgs.length;
        if (n <= 1) return;

        const segmentProgress = Math.max(0, Math.min(n, progress * n));
        let idx = Math.floor(segmentProgress);
        let frac = segmentProgress - idx;

        if (idx >= n) {
          idx = n - 1;
          frac = 1;
        }

        const centers = centersRef.current;
        const baselineW = baselineWidthRef.current || 0;
        const dotOffset = isMobile() ? DOT_RADIUS_MOBILE : DOT_RADIUS;

        const startPx = (centers[idx] ?? 0) + dotOffset;

        const isLastStep = idx === centers.length - 1;

        const endPx = isLastStep
          ? baselineWidthRef.current
          : centers[idx + 1] + dotOffset;

        const px = lerp(startPx, endPx, frac);
        const maxPx = baselineWidthRef.current;

        const pxClamped = Math.max(dotOffset, Math.min(maxPx, px));

        if (activeLineRef.current)
          if (isMobile()) {
            gsap.set(activeLineRef.current, { height: `${pxClamped}px` });
          } else {
            gsap.set(activeLineRef.current, { width: `${pxClamped}px` });
          }

        const SAFETY_OFFSET = 6;
        let activeIndex = 0;

        if (centers && centers.length > 0) {
          activeIndex = centers.reduce((acc, c, i) => {
            if (pxClamped >= c) return i;

            return acc;
          }, -1);
          if (activeIndex < 0) activeIndex = 0;
        }

        if (
          imgARef.current &&
          imgARef.current.dataset.current !== String(activeIndex)
        ) {
          const desiredIndex = activeIndex;
          imgARef.current.src = imgs[desiredIndex].src ?? imgs[desiredIndex];
          imgARef.current.dataset.current = String(desiredIndex);

          const preloadIndex = Math.min(n - 1, desiredIndex + 1);
          if (imgBRef.current) {
            imgBRef.current.src = imgs[preloadIndex].src ?? imgs[preloadIndex];
            imgBRef.current.dataset.current = String(preloadIndex);
            gsap.set(imgBRef.current, { autoAlpha: 0 });
            gsap.set(imgARef.current, { autoAlpha: 1 });
          }
        } else {
          if (imgBRef.current) gsap.set(imgBRef.current, { autoAlpha: 0 });
          if (imgARef.current) gsap.set(imgARef.current, { autoAlpha: 1 });
        }

        const steps = getStepEls();
        const dots = getDotEls();

        steps.forEach((el, i) => {
          const isActive = i === activeIndex;
          gsap.set(el, { opacity: isActive ? 1 : 0.35 });
        });

        dots.forEach((el, i) => {
          const isActive = i === activeIndex;
          gsap.set(el, {
            opacity: isActive ? 1 : 0.45,
            scale: isActive ? 1.15 : 1,
          });
        });
      };

      const buildST = () => {
        const n = imgs.length;
        const pinDistance = window.innerHeight * (n + 0.6);
        st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: `+=${pinDistance}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate(self) {
            if (!isMounted) return;
            updateFromProgress(self.progress);
          },
          invalidateOnRefresh: true,
        });
      };

      initVisuals();
      buildST();

      onResize = () => {
        computeCenters();
        if (st) updateFromProgress(st.progress);
      };
      onRefreshInit = () => {
        computeCenters();
      };

      window.addEventListener("resize", onResize);
      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.refresh();
    }, root);

    return () => {
      isMounted = false;

      ScrollTrigger.getAll().forEach((t) => t.kill());

      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);

      ctx.revert();
    };
  }, []);

  return (
    <div className={styles.main} ref={rootRef}>
      <div className={styles.MainConatiner}>
        <div className={styles.TopSection}>
          <div className={styles.TopImage}>
            <img ref={imgARef} className={styles.layerImg} alt="imgA" />
            <img
              ref={imgBRef}
              className={`${styles.layerImg} ${styles.layerTop}`}
              alt="imgB"
            />
          </div>
        </div>

        <div className={styles.BottomSection}>
          <div className={styles.BottomTop}>
            <h3>HOW IT WORKS ?</h3>
          </div>

          <div className={styles.BottomBottom}>
            <div className={styles.BottomBottomWrapper}>
              <div className={styles.BottomBottomTop}>
                <div data-step="0" className={styles.stepBox}>
                  <h3>SELECT YOUR FORMAT</h3>
                  <p>
                    Choose your physical type: Coffee Beans, Capsules, or Drip
                    Bags. This selection determines your immediate brewing and
                    customization options.
                  </p>
                </div>

                <div data-step="1" className={styles.stepBox}>
                  <h3>DEFINE YOUR COFFEE PROFILE</h3>
                  <p>
                    Curate your perfect flavor: Use Category, Brew Method,
                    Origin, and Process filters to find your ideal blend and
                    product name.
                  </p>
                </div>

                <div data-step="2" className={styles.stepBox}>
                  <h3>SET YOUR SCHEDULE & QUANTITY</h3>
                  <p>
                    Customize your schedule: Confirm the number of bags per
                    shipment and your delivery frequency. Select your total
                    duration from the 3, 6, or 12-month plans.
                  </p>
                </div>

                <div data-step="3" className={styles.stepBox}>
                  <h3>REVIEW & CHECKOUT</h3>
                  <p>
                    Review, pay, and receive: Your customized coffee arrives
                    fresh. Subscription will not auto-renew, and you can cancel
                    anytime.
                  </p>
                </div>
              </div>

              <div className={styles.timeline}>
                <div ref={baselineRef} className={styles.timelineBaseline} />
                <div ref={activeLineRef} className={styles.timelineActive} />
                <span data-dot="0" className={styles.dot} />
                <span data-dot="1" className={styles.dot} />
                <span data-dot="2" className={styles.dot} />
                <span data-dot="3" className={styles.dot} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
