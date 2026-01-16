"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./GlobalLoader.module.css";

const GlobalLoader = () => {
  const pathname = usePathname();
  // Using pathname as a key forces LoaderInner to remount completely on route change.
  // This ensures 'loading' state starts at 'true' immediately for the new page, preventing any flash.
  return <LoaderInner key={pathname} />;
};

const LoaderInner = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial check or wait for layout stable
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5s delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.Overlay} ${!loading ? styles.Hidden : ""}`}>
      <div className={styles.LoaderContainer}>
        <Image
          src="/White-mantis-green-loader.gif"
          alt="Loading..."
          width={150}
          height={150}
          className={styles.LoaderImage}
          priority
          unoptimized // Crucial for GIF animation
        />
      </div>
    </div>
  );
};

export default GlobalLoader;
