"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./StickyBar.module.css";
import { useCart } from "../../../../_context/CartContext";
import { useProductImage } from "../../_context/ProductImageContext";

const StickyBar = ({ groupedChildren, product }) => {
  const router = useRouter();
  const { addItem, refresh } = useCart();
  const { setSelectedImage } = useProductImage();

  // Parse simple and subscription products
  const simpleProduct = useMemo(() =>
    groupedChildren?.find(p => p.type === 'variable'),
    [groupedChildren]
  );

  const subscriptionProduct = useMemo(() =>
    groupedChildren?.find(p => p.type === 'variable-subscription'),
    [groupedChildren]
  );

  // Extract tagline from product metadata
  const tagline = useMemo(() => {
    if (!product?.meta_data) return '';
    const taglineMeta = product.meta_data.find(m => m.key === 'tagline');
    return taglineMeta?.value || '';
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
    return simpleProduct.variation_options.map(variation => ({
      label: variation.attributes.attribute_pa_weight,
      variation: variation
    }));
  }, [simpleProduct]);

  // Extract subscription options
  const subscriptionOptions = useMemo(() => {
    if (!subscriptionProduct?.variation_options) return { frequencies: [], quantities: [], weights: [] };

    const frequencies = new Set();
    const quantities = new Set();
    const weights = new Set();

    subscriptionProduct.variation_options.forEach(variation => {
      frequencies.add(variation.attributes['attribute_pa_simple-subscription-frequenc']);
      quantities.add(variation.attributes['attribute_pa_simple-subscription-quantity']);
      weights.add(variation.attributes.attribute_pa_weight);
    });

    return {
      frequencies: Array.from(frequencies).sort(),
      quantities: Array.from(quantities).sort(),
      weights: Array.from(weights).sort()
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
  }, [weightOptions, subscriptionOptions, selectedWeight, selectedFrequency, selectedQuantity, selectedSubWeight]);

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
    if (!subscriptionProduct?.variation_options || !selectedFrequency || !selectedQuantity || !selectedSubWeight) {
      return null;
    }

    return subscriptionProduct.variation_options.find(variation =>
      variation.attributes['attribute_pa_simple-subscription-frequenc'] === selectedFrequency &&
      variation.attributes['attribute_pa_simple-subscription-quantity'] === selectedQuantity &&
      variation.attributes.attribute_pa_weight === selectedSubWeight
    );
  }, [subscriptionProduct, selectedFrequency, selectedQuantity, selectedSubWeight]);

  // Format frequency label
  const getFrequencyLabel = (freq) => {
    if (freq === '2-week') return 'Every 2 weeks';
    if (freq === '4-week') return 'Every 4 weeks';
    return freq;
  };

  // Handle buy now - add to cart
  const handleBuyNow = async () => {
    if (!selectedWeight?.variation) {
      return;
    }

    try {
      const variationImage = selectedWeight.variation.image;
      const finalImage = typeof variationImage === 'string'
        ? variationImage
        : variationImage?.src || product?.images?.[0]?.src;

      await addItem(simpleProduct?.id, qty, {
        variation_id: selectedWeight.variation.id,
        name: product?.name || 'Product',
        description: product?.description,
        image: finalImage,
      });

      refresh();
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  // Handle subscription checkout
  const handleSubscription = () => {
    if (!subscriptionProduct || !subscriptionVariation) {
      toast.error('Please select all subscription options');
      return;
    }

    // Navigate to checkout with subscription details
    const params = new URLSearchParams({
      mode: 'subscription',
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
            {/* Weight Selection Buttons */}
            <div className={styles.WeightOptions}>
              {weightOptions.map((w) => (
                <button
                  key={w.label}
                  className={
                    selectedWeight?.label === w.label
                      ? styles.ActiveWeight
                      : styles.WeightBtn
                  }
                  onClick={() => setSelectedWeight(w)}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className={styles.CountIncDec}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{String(qty).padStart(2, "0")}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
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

              <button className={styles.AddtoCartPriceCta} onClick={handleBuyNow}>
                Buy for AED {simplePrice.toFixed(2)}
              </button>

            </div>
          </div>
        </div>
      </div>

      {showSubscribe && subscriptionProduct && (
        <div className={styles.PopupOverlay}>
          <div className={styles.Popup}>
            <h3>Subscribe</h3>
            <p>Choose your subscription preferences</p>

            {/* Weight Selection */}
            <div className={styles.SubscriptionSection}>
              <h4>Weight</h4>
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
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Selection */}
            <div className={styles.SubscriptionSection}>
              <h4>Delivery Frequency</h4>
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

            {/* Quantity Selection */}
            <div className={styles.SubscriptionSection}>
              <h4>Bags per Delivery</h4>
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
                    {quantity} {quantity === '1' ? 'bag' : 'bags'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display */}
            {subscriptionVariation && (
              <div className={styles.PopupPrice}>
                <div>AED {subscriptionVariation.price.toFixed(2)} / delivery</div>
                {subscriptionVariation.subscription_discount > 0 && (
                  <div className={styles.Discount}>
                    Save {subscriptionVariation.subscription_discount}%
                  </div>
                )}
              </div>
            )}

            <div className={styles.PopupActions}>
              <button
                className={styles.PopupCancel}
                onClick={() => setShowSubscribe(false)}
              >
                Cancel
              </button>

              <button onClick={() => handleSubscription()} className={styles.PopupConfirm}>
                Confirm Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickyBar;
