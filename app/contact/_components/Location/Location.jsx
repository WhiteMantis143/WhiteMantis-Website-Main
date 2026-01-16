
import React from "react";
import styles from "./Location.module.css";

export default function Location() {
  const iframeSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57779.01282360603!2d55.21730450292126!3d25.163118949361298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f69d10711b6cd%3A0xe0c17f643b4a59ef!2sWhite%20Mantis%20Roastery!5e0!3m2!1sen!2sin!4v1764579368831!5m2!1sen!2sin";

  const directionsUrl =
    "https://www.google.com/maps/search/?api=1&query=White+Mantis+Roastery";

  return (
    <section className={styles.sectionWrapper}>
      <h3 className={styles.title}>VISIT US</h3>

      <div className={styles.mapWrapper}>
        <iframe
          className={styles.mapIframe}
          src={iframeSrc}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="White Mantis Roastery map"
        ></iframe>

        <aside className={styles.infoCard}>
          <div className={styles.infoTitle}>White Mantis Roastery &amp; Lab</div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsBtn}
          >
            Get Directions
          </a>
        </aside>
      </div>
    </section>
  );
}
