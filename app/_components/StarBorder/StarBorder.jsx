"use client";

import styles from "./StarBorder.module.css";

export default function StarBorder({
  children,
  thickness = 0.2,
  speed = 2.0,
}) {
  return (
    <div
      className={styles.wrapper}
      style={{
        "--border-width": thickness,
  "--border-speed": `${speed}s`,
      }}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="movingGradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100"
            y2="0"
          >
            <stop offset="0%" stopColor="#6C7A5F" />
            <stop offset="40%" stopColor="#A7C1A1" />
            <stop offset="70%" stopColor="#6C7A5F" />
            <stop offset="100%" stopColor="#8FA98A" />
          </linearGradient>
        </defs>

        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="2"
          ry="2"
          fill="none"
          stroke="url(#movingGradient)"
        strokeWidth="var(--border-width)"

          pathLength="1"
          className={styles.path}
        />
      </svg>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
