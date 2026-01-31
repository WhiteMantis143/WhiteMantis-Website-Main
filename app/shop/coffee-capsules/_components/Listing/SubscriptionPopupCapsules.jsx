"use client";
import React, { useMemo, useRef, useEffect } from "react";

import styles from "./SubscriptionPopupCapsules.module.css";

const SubscriptionPopupCapsules = ({
  open,
  onClose,
  subscriptionProduct,
  frequencies = [],
  quantities = [],
  selectedFrequency,
  selectedQuantity,
  onSelectFrequency,
  onSelectQuantity,
  onConfirm,
}) => {
  if (!open) return null;
  const selectedVariation = useMemo(() => {
    if (!subscriptionProduct || !selectedFrequency || !selectedQuantity) {
      return null;
    }

    return subscriptionProduct.variation_options?.find(
      (v) =>
        v.attributes["attribute_pa_simple-subscription-frequenc"] ===
          selectedFrequency &&
        v.attributes["attribute_pa_simple-subscription-quantity"] ===
          selectedQuantity,
    );
  }, [subscriptionProduct, selectedFrequency, selectedQuantity]);
  const pricing = useMemo(() => {
    if (!selectedVariation) return null;

    const basePrice = Number(selectedVariation.price);
    const discount =
      Number(
        selectedVariation.subscription_discount ??
          selectedVariation.subscription_details?.subscription_discount,
      ) || 0;

    const finalPrice = basePrice - (basePrice * discount) / 100;

    return {
      basePrice,
      discount,
      finalPrice,
    };
  }, [selectedVariation]);
const popupRef = useRef(null);
useEffect(() => {
  if (!open) return;

  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [open, onClose]);

  return (
    <div className={styles.Overlay}>
    <div className={styles.Popup} ref={popupRef}>

        <button className={styles.Close} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.Title}>COFFEE CAPSULES SUBSCRIPTION</h2>

        <div className={styles.Section}>
          <p className={styles.Label}>Bag Amount</p>

          <div className={styles.Row}>
            {quantities.map((q) => (
              <button
                key={q}
                className={
                  selectedQuantity === q ? styles.OptionActive : styles.Option
                }
                onClick={() => onSelectQuantity(q)}
              >
                <span>{q}x</span>
                <span className={styles.Radio} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.Section}>
          <p className={styles.Label}>Box of 8 capsules subscription</p>

          <div className={styles.Column}>
            {frequencies.map((f) => (
              <button
                key={f}
                className={
                  selectedFrequency === f ? styles.OptionActive : styles.Option
                }
                onClick={() => onSelectFrequency(f)}
              >
                <span>Delivery every {f} days</span>
                <span className={styles.Radio} />
              </button>
            ))}
          </div>
        </div>

        {pricing && (
          <button className={styles.Confirm} onClick={onConfirm}>
            Subscribe – AED {Math.round(pricing.finalPrice)}
            {pricing.discount > 0 && <> (Save Approx. {pricing.discount}%)</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPopupCapsules;
