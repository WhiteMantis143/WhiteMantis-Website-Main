"use client";

import { useRouter } from "next/navigation";
import styles from "./StickyBar.module.css";
import { useCart } from "../../../../../_context/CartContext";
import { useProductImage } from "../../_context/ProductImageContext";
import React, { useState, useEffect, useMemo, useRef } from "react";

const StickyBar = ({ groupedChildren, product }) => {
  const router = useRouter();
  const { addItem, refresh } = useCart();
  const { setSelectedImage } = useProductImage();
  const [showWeightMenu, setShowWeightMenu] = useState(false);
  const popupRef = useRef(null);


  // Parse simple and subscription products
  const simpleProduct = useMemo(
    () => groupedChildren?.find((p) => p.type === "variable"),
    [groupedChildren],
  );

  const subscriptionProduct = useMemo(
    () => groupedChildren?.find((p) => p.type === "variable-subscription"),
    [groupedChildren],
  );

  // Extract tagline from product metadata
  const tagline = useMemo(() => {
    if (!product?.meta_data) return "";
    const taglineMeta = product.meta_data.find((m) => m.key === "tagline");
    return taglineMeta?.value || "";
  }, [product]);

  // State management
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [selectedSubWeight, setSelectedSubWeight] = useState(null);

  // Extract weight options from simple product
  const weightOptions = useMemo(() => {
    if (!simpleProduct?.variation_options) return [];
    return simpleProduct.variation_options.map((variation) => ({
      label: variation.attributes.attribute_pa_weight,
      variation: variation,
    }));
  }, [simpleProduct]);
  const hasMultipleWeights = weightOptions.length > 1;

  // Extract subscription options
  const subscriptionOptions = useMemo(() => {
    if (!subscriptionProduct?.variation_options)
      return { frequencies: [], quantities: [], weights: [] };

    const frequencies = new Set();
    const quantities = new Set();
    const weights = new Set();

    subscriptionProduct.variation_options.forEach((variation) => {
      frequencies.add(
        variation.attributes["attribute_pa_simple-subscription-frequenc"],
      );
      quantities.add(
        variation.attributes["attribute_pa_simple-subscription-quantity"],
      );
      weights.add(variation.attributes.attribute_pa_weight);
    });

    return {
      frequencies: Array.from(frequencies).sort(),
      quantities: Array.from(quantities).sort(),
      weights: Array.from(weights).sort(),
    };
  }, [subscriptionProduct]);

  // Initialize default selections
  useEffect(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      setSelectedWeight(weightOptions[0]);
    }
    if (subscriptionOptions.frequencies.length > 0 && !selectedFrequency) {
      setSelectedFrequency(subscriptionOptions.frequencies[0]);
    }
    if (subscriptionOptions.quantities.length > 0 && !selectedQuantity) {
      setSelectedQuantity(subscriptionOptions.quantities[0]);
    }
    if (subscriptionOptions.weights.length > 0 && !selectedSubWeight) {
      setSelectedSubWeight(subscriptionOptions.weights[0]);
    }
  }, [
    weightOptions,
    subscriptionOptions,
    selectedWeight,
    selectedFrequency,
    selectedQuantity,
    selectedSubWeight,
  ]);

  // Update image when weight selection changes
  useEffect(() => {
    const varImage = selectedWeight?.variation?.image;
    if (varImage) {
      const src = typeof varImage === "string" ? varImage : varImage.src;
      if (src) setSelectedImage(src);
    }
  }, [selectedWeight, setSelectedImage]);

  // Calculate simple product price
  const simplePrice = useMemo(() => {
    if (!selectedWeight?.variation) return 0;
    return selectedWeight.variation.price * qty;
  }, [selectedWeight, qty]);

  // Find matching subscription variation
  const subscriptionVariation = useMemo(() => {
    if (
      !subscriptionProduct?.variation_options ||
      !selectedFrequency ||
      !selectedQuantity ||
      !selectedSubWeight
    ) {
      return null;
    }

    return subscriptionProduct.variation_options.find(
      (variation) =>
        variation.attributes["attribute_pa_simple-subscription-frequenc"] ===
          selectedFrequency &&
        variation.attributes["attribute_pa_simple-subscription-quantity"] ===
          selectedQuantity &&
        variation.attributes.attribute_pa_weight === selectedSubWeight,
    );
  }, [
    subscriptionProduct,
    selectedFrequency,
    selectedQuantity,
    selectedSubWeight,
  ]);

  // Format frequency label
  const getFrequencyLabel = (freq) => {
    if (freq === "2-week") return "Every 2 weeks";
    if (freq === "4-week") return "Every 4 weeks";
    return freq;
  };

  // Handle buy now - add to cart
  const handleBuyNow = async () => {
    if (!selectedWeight?.variation) {
      return;
    }

    try {
      const variationImage = selectedWeight.variation.image;
      const finalImage =
        typeof variationImage === "string"
          ? variationImage
          : variationImage?.src || product?.images?.[0]?.src;

      await addItem(simpleProduct?.id, qty, {
        variation_id: selectedWeight.variation.id,
        name: product?.name || "Product",
        description: product?.description,
        image: finalImage,
        quantity: qty,
        tagline: tagline,
      });

      refresh();
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };
useEffect(() => {
  if (!showSubscribe) return;

  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setShowSubscribe(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showSubscribe]);

  // Handle subscription checkout
  const handleSubscription = () => {
    if (!subscriptionProduct || !subscriptionVariation) {
      console.error("Please select all subscription options");
      return;
    }

    // Navigate to checkout with subscription details
    const params = new URLSearchParams({
      mode: "subscription",
      subscriptionId: subscriptionProduct.id.toString(),
      variationId: subscriptionVariation.id.toString(),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  // Don't render if no products
  if (!simpleProduct && !subscriptionProduct) {
    return null;
  }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Left}>
            <h4>{`${product?.name || simpleProduct?.name || "Product"} ${tagline}`}</h4>
            <p>{product?.short_description || ""}</p>
          </div>

          <div className={styles.Center}>
            <div className={styles.WeightDropdown}>
              {hasMultipleWeights ? (
                <>
                  <button
                    className={styles.WeightSelect}
                    onClick={() => setShowWeightMenu((prev) => !prev)}
                  >
                    <span>{selectedWeight?.label}</span>

                    <svg
                      width="13"
                      height="8"
                      viewBox="0 0 13 8"
                      xmlns="http://www.w3.org/2000/svg"
                      className={
                        showWeightMenu ? styles.RotateUp : styles.RotateDown
                      }
                    >
                      <path
                        d="M6.25635 0L0.0000755461 7.40326L12.5126 7.40326L6.25635 0Z"
                        fill="#6C7A5F"
                      />
                    </svg>
                  </button>

                  {showWeightMenu && (
                    <div className={styles.WeightMenu}>
                      {weightOptions.map((w) => (
                        <button
                          key={w.label}
                          className={styles.WeightMenuItem}
                          onClick={() => {
                            setSelectedWeight(w);
                            setShowWeightMenu(false);
                          }}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.SingleWeight}>
                  {selectedWeight?.label}
                </div>
              )}
            </div>

            <div className={styles.CountIncDec}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{String(qty).padStart(2, "0")}</span>
              <button
                onClick={() => setQty((q) => Math.min(5, q + 1))}
                disabled={qty >= 5}
                style={{
                  opacity: qty >= 5 ? 0.5 : 1,
                  cursor: qty >= 5 ? "not-allowed" : "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.Right}>
            <p className={styles.type}>Purchase type :</p>

            <div className={styles.Cta}>
              {subscriptionProduct && (
                <button
                  className={styles.SubscribeCta}
                  onClick={() => setShowSubscribe(true)}
                >
                  <span>Subscribe &amp; save</span>

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="18"
                      height="18"
                      rx="9"
                      transform="matrix(-1 0 0 1 18 0)"
                      fill="#6C7A5F"
                    />
                    <path
                      d="M8 6L11 9L8 12"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              <button
                className={styles.AddtoCartPriceCta}
                onClick={handleBuyNow}
              >
                Buy for AED {simplePrice.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubscribe && subscriptionProduct && (
        <div className={styles.PopupOverlay}>
      <div className={styles.Popup} ref={popupRef}>

            <button
              className={styles.PopupClose}
              onClick={() => setShowSubscribe(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <h3>COFFEE BEANS SUBSCRIPTION</h3>

            {/* Bag Amount */}
            <div className={styles.SubscriptionSection}>
              <h4>Bag Amount</h4>
              <div className={styles.FrequencyOptions}>
                {subscriptionOptions.quantities.map((quantity) => (
                  <button
                    key={quantity}
                    className={
                      selectedQuantity === quantity
                        ? styles.ActiveFrequency
                        : styles.FrequencyBtn
                    }
                    onClick={() => setSelectedQuantity(quantity)}
                  >
                    {quantity}x
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className={styles.SubscriptionSection}>
              <h4>Size</h4>
              <div className={styles.FrequencyOptions}>
                {subscriptionOptions.weights.map((weight) => (
                  <button
                    key={weight}
                    className={
                      selectedSubWeight === weight
                        ? styles.ActiveFrequency
                        : styles.FrequencyBtn
                    }
                    onClick={() => setSelectedSubWeight(weight)}
                  >
                    {weight === "250g" ? "250 grams" : weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className={styles.SubscriptionSection}>
              <h4>Frequency</h4>
              <div className={styles.FrequencyOptions}>
                {subscriptionOptions.frequencies.map((freq) => (
                  <button
                    key={freq}
                    className={
                      selectedFrequency === freq
                        ? styles.ActiveFrequency
                        : styles.FrequencyBtn
                    }
                    onClick={() => setSelectedFrequency(freq)}
                  >
                    {getFrequencyLabel(freq)}
                  </button>
                ))}
              </div>
            </div>

     {subscriptionVariation && (
  <div className={styles.PopupActions}>
    {(() => {
      const basePrice = Number(subscriptionVariation.price);

      // ✅ CORRECT discount source for StickyBar
      const discount =
        Number(subscriptionVariation.subscription_discount) || 0;

      const finalPrice =
        discount > 0
          ? basePrice - (basePrice * discount) / 100
          : basePrice;

      return (
        <button
          onClick={handleSubscription}
          className={styles.PopupConfirm}
        >
          Subscribe – AED {Math.round(finalPrice)}
          {discount > 0 && <> (Save Approx. {discount}%)</>}
        </button>
      );
    })()}
  </div>
)}


          </div>
        </div>
      )}
    </>
  );
};

export default StickyBar;
