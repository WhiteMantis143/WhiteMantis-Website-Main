"use client";
import React, { useState } from "react";
import styles from "./CommunityPopup.module.css";
import Image from "next/image";
import popupimage from "./popup.png";

const CommunityPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/website/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          source: "popup",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribed(true);
      } else {
        setError(data.message || "Subscription failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.left}>
          <Image
            src={popupimage}
            alt="Coffee plant"
            fill
            priority
            className={styles.image}
          />
        </div>

        <div className={styles.right}>
          {/* CLOSE BUTTON */}
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>

          {/* AFTER SUBSCRIBE STATE */}
          {subscribed ? (
            <div className={styles.thankYou}>
              <h3>Thanks for subscribing!</h3>
              <p>You’re now part of the White Mantis Inner Circle ☕</p>
            </div>
          ) : (
            <>
              <span className={styles.label}>
                Specialty Coffee News in Your Inbox
              </span>

              <h3>
                THE WHITE MANTIS DISPATCH:
                <br />
                SUBSCRIBE TO OUR NEWSLETTER!
              </h3>

              <p>
                Stay connected to the world of specialty coffee craft. Get
                exclusive access to new product offers, learn expert brewing
                tips, and receive curated updates on global coffee releases
                directly in your inbox.
              </p>

              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.subscribe}
                disabled={!email || loading}
                onClick={handleSubscribe}
              >
                {loading ? "Subscribing..." : "Subscribe now"}
              </button>

              <button
                className={styles.noThanks}
                onClick={onClose}
                disabled={loading}
              >
                No Thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPopup;
