"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { usePathname } from "next/navigation";
import styles from "./Begins.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";
import three from "./3.png";

// Memoize slides array to prevent recreation on every render
const slides = [
  { id: 1, src: one, label: "Hambella Estate, Ethiopia" },
  { id: 2, src: two, label: "Santa Leticia Estate, El Salvador" },
  { id: 3, src: three, label: "Geisha Village, Ethiopia" },
  { id: 4, src: one, label: "Aalamin — Central Sumatra, Indonesia" },
  { id: 5, src: two, label: "Thogarihunkal Estate, India" },
];

export default function Begins() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  // Delay mount to ensure DOM is ready after navigation
  React.useEffect(() => {
    // Use requestAnimationFrame to delay until after React finishes reconciliation
    const rafId = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
      setMounted(false);
    };
  }, [pathname]);

  // Don't render carousel until after navigation completes
  if (!mounted) {
    return (
      <section className={styles.Main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <h3>WHERE OUR COFFEE BEGINS</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.Main} key={`wholesale-carousel-${pathname}`}>
      <div className={styles.MainContainer}>
        <div className={styles.Top}>
          <h3>WHERE OUR COFFEE BEGINS</h3>
        </div>

        <div
          className={styles.viewport}
          ref={emblaRef}
          suppressHydrationWarning
        >
          <div className={styles.track} suppressHydrationWarning>
            {slides.map((s) => (
              <div key={`wholesale-slide-${s.id}`} className={styles.cardWrap}>
                <div className={styles.card}>
                  <Image
                    src={s.src}
                    alt={s.label}
                    fill
                    sizes="(max-width: 1440px) 540px"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                  />
                </div>
                <p className={styles.caption}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
