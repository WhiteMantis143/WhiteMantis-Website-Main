"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./Lisiting.module.css";
import Image from "next/image";
import Link from "next/link";
import Wishlist from "../../../../_components/Whishlist";
import AddToCart from "../../../../_components/AddToCart";

/* ---------------- SLUG HELPER ---------------- */
const slugify = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Lisiting = () => {
  const PARENT_ID = 217;
  const ITEMS_PER_LOAD = 9;

  // 1. Data State (Functionality)
  const [allProducts, setAllProducts] = useState([]);
  const [productsCategories, setProductsCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. UI/Filter State
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [sortType, setSortType] = useState("Recommended");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [sortOpen, setSortOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // UI Ref for Mobile Filters
  const mobileFiltersRef = useRef(null);

  // 3. Fetch Data Once on Mount (Functionality)
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`/api/website/products/categories?parent_id=${PARENT_ID}`),
          fetch(`/api/website/products?category_id=${PARENT_ID}`),
        ]);

        if (catRes.ok && prodRes.ok) {
          const catJson = await catRes.json();
          const prodJson = await prodRes.json();
          setProductsCategories(catJson.data || []);
          setAllProducts(prodJson || []);

          console.log(prodJson);

          // Initialize openMenus state for UI
          const initOpen = {};
          if (catJson.data) {
            catJson.data.forEach((cat) => {
              initOpen[cat.slug] = false;
            });
          }
          setOpenMenus(initOpen);
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 4. FRONTEND ONLY: Filter & Sort logic (Functionality)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        product.categories?.some((cat) => selectedCategories.includes(cat.id)),
      );
    }

    // Sorting
    const sortMap = {
      "Latest to Oldest": (a, b) => b.id - a.id,
      "Oldest to Latest": (a, b) => a.id - b.id,
      Recommended: (a, b) => 0, // Default or specific logic
    };

    if (sortType === "Latest to Oldest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortType === "Oldest to Latest") {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [allProducts, selectedCategories, sortType]);

  // 5. Handlers
  const handleToggleCategory = (id) => {
    setSelectedCategories((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      return newSelection;
    });
    setVisibleCount(ITEMS_PER_LOAD); // Reset scroll position on filter
  };

  const toggleMenu = (slug) => {
    setOpenMenus((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
  };

  // Helper to get variation data (Functionality)
  const getDisplayData = (product) => {
    let targetVariation = null;
    if (product.children) {
      const children = Object.values(product.children);
      for (const child of children) {
        // Try to find 250g weight first (legacy logic)
        let vOption = child.variation_options?.find(
          (v) => v.attributes?.attribute_pa_weight === "250g",
        );

        // If not found, looking for capsule or just take the first logical variation
        if (!vOption && child.variation_options?.length > 0) {
          vOption = child.variation_options[0];
        }

        if (vOption) {
          targetVariation = vOption;
          break;
        }
      }
    }
    return {
      price: targetVariation?.price || product.price || product.regular_price,
      regular_price: targetVariation?.regular_price || product.regular_price,
      sale_price: targetVariation?.sale_price || product.sale_price,
      image:
        targetVariation?.image ||
        product.image ||
        product.images?.[0]?.src ||
        product.images?.[0],
    };
  };

  // Render Categories Recursive Helper (UI - Preserved from Listing.jsx)
  function renderCategories(categories) {
    if (!categories || !Array.isArray(categories) || categories.length === 0)
      return null;

    return categories.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;

      if (hasChildren) {
        return (
          <div key={cat.id} className={styles.FilterBox}>
            <div
              className={styles.FilterHeader}
              onClick={() => toggleMenu(cat.slug)}
            >
              <h5>{cat.name}</h5>
              {openMenus[cat.slug] ? <span>✕</span> : <span>▾</span>}
            </div>
            <div
              className={`${styles.AnimatedBox} ${openMenus[cat.slug] ? styles.open : ""
                }`}
            >
              <div className={styles.FilterOptions}>
                {renderCategories(cat.children)}
              </div>
            </div>
          </div>
        );
      }

      return (
        <label key={cat.id}>
          <input
            type="checkbox"
            checked={selectedCategories.includes(cat.id)}
            onChange={() => handleToggleCategory(cat.id)}
          />
          {cat.name}
        </label>
      );
    });
  }

  // Outside click for mobile filters (UI - Preserved)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileFiltersRef.current &&
        !mobileFiltersRef.current.contains(e.target)
      ) {
        setIsMobileFiltersOpen(false);
      }
    };
    if (isMobileFiltersOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileFiltersOpen]);

  if (isLoading) {
    return (
      <div className={styles.LoaderWrapper}>
        <Image
          src="/White-mantis-green-loader.gif"
          alt="Loading products"
          width={120}
          height={120}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.MainContainer}>
        {/* Sidebar Filters */}
        <div className={styles.LeftConatiner}>
          <div className={styles.LeftTop}>
            <p>Filter</p>
          </div>
          <div className={styles.LeftBottom}>
            {renderCategories(productsCategories)}
          </div>
        </div>

        {/* Right Product Section */}
        <div className={styles.RightConatiner}>
          <div className={styles.RightTop}>
            <div className={styles.RightTopLeft}>
              <div className={styles.CatName}>
                <h3>Coffee Drip Bags</h3>
              </div>
              <div className={styles.CatCount}>
                <p>({filteredProducts.length} items)</p>
              </div>
            </div>

            <div className={styles.RightTopRight}>
              <button
                className={styles.MobileFilterBtn}
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66667 8V6.66667H7.33333V8H4.66667ZM2 4.66667V3.33333H10V4.66667H2ZM0 1.33333V0H12V1.33333H0Z"
                    fill="#6E736A"
                  />
                </svg>
                Filter
              </button>

              <div className={styles.SortBy}>
                <p>Sort by:</p>
              </div>
              <div className={styles.SortWrapper}>
                <div
                  className={styles.SortOptions}
                  onClick={() => setSortOpen(!sortOpen)}
                >
                  <p>{sortType}</p>
                </div>
                {sortOpen && (
                  <div className={styles.SortDropdown}>
                    {[
                      "Recommended",
                      "Latest to Oldest",
                      "Oldest to Latest",
                    ].map((item) => (
                      <p
                        key={item}
                        onClick={() => {
                          setSortType(item);
                          setSortOpen(false);
                        }}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.RightBottom}>
            <div className={styles.ProductsGrid}>
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const displayData = getDisplayData(product);

                /* --------- SEO SLUG + ID --------- */
                const productSlug = product.tagline
                  ? slugify(`${product.name}-${product.tagline}`)
                  : slugify(product.name);
                const productUrl = `/products/${productSlug}-${product.id}`;

                // Get the 250g variation ID and child product ID (Functionality)
                let variation_id = null;
                let child_product_id = null;
                if (product.children) {
                  const children = Object.values(product.children);
                  for (const child of children) {
                    let vOption = child.variation_options?.find(
                      (v) => v.attributes?.attribute_pa_weight === "250g",
                    );

                    // Fallback for capsules or other types
                    if (!vOption && child.variation_options?.length > 0) {
                      vOption = child.variation_options[0];
                    }

                    if (vOption) {
                      variation_id = vOption.id;
                      child_product_id = child.id;
                      break;
                    }
                  }
                }

                // Format product data for AddToCart (Functionality)
                const cartProduct = {
                  product_id: child_product_id || product.id, // Use child ID if available
                  variation_id: variation_id,
                  name: product.name,
                  image: displayData.image,
                  description: product.description || product.short_description,
                  quantity: 1,
                };

                return (
                  <div className={styles.ProductCard} key={product.id}>
                    <div className={styles.ProductTop}>
                      {/* <div className={styles.WishlistIcon}>
                        <Wishlist product={product} />
                      </div> */}
                      <Link
                        href={productUrl}
                        className={styles.ProductImage}
                      >
                        {displayData.image ? (
                          <Image
                            src={displayData.image}
                            alt={product.name}
                            width={300}
                            height={300}
                          />
                        ) : (
                          <div className={styles.NoImage}>No Image</div>
                        )}
                      </Link>
                    </div>

                    <div className={styles.ProductBottom}>
                      <Link
                        href={productUrl}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className={styles.ProductInfo}>
                          <div className={styles.ProductPrice}>
                            <h4>AED {displayData.price}</h4>
                            {displayData.sale_price &&
                              displayData.sale_price !==
                              displayData.regular_price && (
                                <p className={styles.OldPrice}>
                                  AED {displayData.regular_price}
                                </p>
                              )}
                          </div>
                          <div className={styles.Line}></div>
                          <div className={styles.ProductName}>
                            <h3>{`${product.name} ${product.tagline}`}</h3>
                            <p>{product.tasting_notes_description}</p>
                          </div>
                        </div>
                      </Link>
                      <div className={styles.ProductActions}>
                        <AddToCart product={cartProduct} />
                        {/* Preserving Subscribe button from UI */}
                        {/* <button className={styles.Subscribe}>Subscribe</button> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className={styles.LoadMore}>
                <button className={styles.LoadMoreCta} onClick={handleLoadMore}>
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>

        {isMobileFiltersOpen && (
          <div className={styles.MobileFilters} ref={mobileFiltersRef}>
            <div className={styles.MobileFilterHeader}>
              <p>Filters</p>
              <span onClick={() => setIsMobileFiltersOpen(false)}>✕</span>
            </div>
            <div className={styles.LeftBottom}>
              {renderCategories(productsCategories)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lisiting;
