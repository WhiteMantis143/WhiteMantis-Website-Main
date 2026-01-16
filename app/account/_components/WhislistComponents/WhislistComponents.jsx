"use client";
import React, { useState, useEffect } from "react";
import { useWishlist } from "../../../_context/WishlistContext";
import { useCart } from "../../../_context/CartContext";
import styles from "./WhislistComponents.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const WhislistComponents = () => {
  const { items: wishlistData, loading, remove } = useWishlist();
  const { addItem } = useCart();
  const router = useRouter();

  // Track selected variation for each product
  const [selectedVariations, setSelectedVariations] = useState({});

  // Initialize default selections when wishlist data loads
  useEffect(() => {
    if (wishlistData.length > 0) {
      const initialSelections = {};
      wishlistData.forEach((item) => {
        if (item.children?.[0]?.variation_options?.length > 0) {
          // Set first variation as default
          initialSelections[item.id] = item.children[0].variation_options[0];
        }
      });
      setSelectedVariations(initialSelections);
    }
  }, [wishlistData]);

  const handleRemove = async (productId) => {
    await remove(productId);
  };

  const handleProductClick = (slug) => {
    router.push(`/product/${slug}`);
  };

  const handleWeightChange = (productId, weight) => {
    const product = wishlistData.find((item) => item.id === productId);
    if (product?.children?.[0]?.variation_options) {
      const variation = product.children[0].variation_options.find(
        (v) => v.attributes.attribute_pa_weight === weight
      );
      if (variation) {
        setSelectedVariations((prev) => ({
          ...prev,
          [productId]: variation,
        }));
      }
    }
  };

  const handleAddToCart = async (item) => {
    const selectedVariation = selectedVariations[item.id];

    if (!selectedVariation) {
      toast.error("Please select a weight");
      return;
    }

    const childProduct = item.children?.[0];
    if (!childProduct) {
      toast.error("Product not available");
      return;
    }

    try {
      const variationImage = selectedVariation.image;
      const finalImage = typeof variationImage === 'string'
        ? variationImage
        : variationImage?.src || item.image;

      await addItem(childProduct.id, 1, {
        variation_id: selectedVariation.id,
        name: item.name || 'Product',
        description: item.description,
        image: finalImage,
      });

      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const getVariationImage = (item) => {
    const selectedVariation = selectedVariations[item.id];
    if (selectedVariation?.image) {
      return selectedVariation.image;
    }
    // Fallback to first variation image or parent image
    return item.children?.[0]?.variation_options?.[0]?.image || item.image;
  };

  const getVariationPrice = (item) => {
    const selectedVariation = selectedVariations[item.id];
    if (selectedVariation?.price) {
      return `AED ${parseFloat(selectedVariation.price).toFixed(2)}`;
    }
    // Fallback to item price
    if (typeof item.price === 'object') {
      const price = item.price.final_price || item.price.sale_price || item.price.regular_price || 0;
      return `AED ${parseFloat(price).toFixed(2)}`;
    }
    return `AED ${parseFloat(item.price || 0).toFixed(2)}`;
  };

  const getRegularPrice = (item) => {
    const selectedVariation = selectedVariations[item.id];

    if (selectedVariation) {
      const regularPrice = selectedVariation.regular_price;
      const salePrice = selectedVariation.sale_price;

      if (regularPrice && salePrice && parseFloat(regularPrice) > parseFloat(salePrice)) {
        return `AED ${parseFloat(regularPrice).toFixed(2)}`;
      }
    }

    return null;
  };

  const getAvailableWeights = (item) => {
    if (!item.children?.[0]?.variation_options) return [];

    return item.children[0].variation_options.map((variation) => ({
      label: variation.attributes.attribute_pa_weight,
      variation: variation,
    }));
  };

  if (loading) {
    return (
      <div className={styles.Main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <div className={styles.TopLeft}>
              <h3>Wishlist</h3>
            </div>
            <div className={styles.WhishListCount}>
              <p>(Loading...)</p>
            </div>
          </div>
          <div className={styles.EmptyState}>
            <p className={styles.EmptyText}>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.Top}>
          <div className={styles.TopLeft}>
            <h3>Wishlist</h3>
          </div>
          <div className={styles.WhishListCount}>
            <p>({wishlistData.length} items)</p>
          </div>
        </div>

        {wishlistData.length === 0 ? (
          <div className={styles.EmptyState}>
            <p className={styles.EmptyText}>Your wish list is empty.</p>
            <p className={styles.EmptySubText}>
              Explore more and shortlist some items.
            </p>
            <button className={styles.ShopNow} onClick={() => router.push('/shop')}>
              Shop now
            </button>
          </div>
        ) : (
          <div className={styles.Bottom}>
            {wishlistData.map((item) => {
              const availableWeights = getAvailableWeights(item);
              const selectedVariation = selectedVariations[item.id];
              const variationImage = getVariationImage(item);

              return (
                <div className={styles.Card} key={item.id}>
                  <div className={styles.CardTop}>
                    <div
                      className={styles.Remove}
                      onClick={() => handleRemove(item.id)}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="32"
                          height="32"
                          rx="16"
                          fill="#6C7A5F"
                          fillOpacity="0.2"
                        />
                        <path
                          d="M11.0125 22.4016L9.60156 20.9906L14.6072 15.985L9.60156 11.0125L11.0125 9.60156L16.0181 14.6072L20.9906 9.60156L22.4016 11.0125L17.3959 15.985L22.4016 20.9906L20.9906 22.4016L16.0181 17.3959L11.0125 22.4016Z"
                          fill="#6C7A5F"
                        />
                      </svg>
                    </div>

                    <div
                      className={styles.ImgContainer}
                      onClick={() => handleProductClick(item.slug)}
                      style={{ cursor: 'pointer' }}
                    >
                      {variationImage ? (
                        <Image
                          src={variationImage}
                          alt={item.name || "Product"}
                          className={styles.Img}
                          width={200}
                          height={200}
                        />
                      ) : (
                        <div className={styles.Img} style={{ background: '#f0f0f0' }} />
                      )}
                    </div>
                  </div>

                  <div className={styles.CardMiddle}>
                    <div className={styles.Price}>
                      <h4>{getVariationPrice(item)}</h4>
                      {getRegularPrice(item) && <p>{getRegularPrice(item)}</p>}
                    </div>
                    <div className={styles.line}></div>
                    <div
                      className={styles.TagLine}
                      onClick={() => handleProductClick(item.slug)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h4>{item.name}</h4>
                    </div>

                    {/* Weight Selection */}
                    {availableWeights.length > 0 && (
                      <div className={styles.WeightSelector}>
                        <select
                          value={selectedVariation?.attributes?.attribute_pa_weight || ''}
                          onChange={(e) => handleWeightChange(item.id, e.target.value)}
                          className={styles.WeightDropdown}
                        >
                          {availableWeights.map((w) => (
                            <option key={w.label} value={w.label}>
                              {w.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className={styles.CardBottom}>
                    <button
                      className={styles.Bag}
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhislistComponents;
