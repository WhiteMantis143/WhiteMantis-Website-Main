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
  const PARENT_ID = 134;
  const ITEMS_PER_LOAD = 9;

  /* ---------------- STATE ---------------- */
  const [allProducts, setAllProducts] = useState([]);
  const [productsCategories, setProductsCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [sortType, setSortType] = useState("Recommended");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [sortOpen, setSortOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const mobileFiltersRef = useRef(null);

  /* ---------------- FETCH DATA ---------------- */
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

          const initOpen = {};
          catJson.data?.forEach((cat) => {
            initOpen[cat.slug] = false;
          });
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

  /* ---------------- FILTER + SORT ---------------- */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        product.categories?.some((cat) =>
          selectedCategories.includes(cat.id)
        )
      );
    }

    if (sortType === "Latest to Oldest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortType === "Oldest to Latest") {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [allProducts, selectedCategories, sortType]);

  /* ---------------- HANDLERS ---------------- */
  const handleToggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setVisibleCount(ITEMS_PER_LOAD);
  };

  const toggleMenu = (slug) => {
    setOpenMenus((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
  };

  /* ---------------- VARIATION HELPER ---------------- */
  const getDisplayData = (product) => {
    let targetVariation = null;

    if (product.children) {
      const children = Object.values(product.children);
      for (const child of children) {
        const v250 = child.variation_options?.find(
          (v) => v.attributes?.attribute_pa_weight === "250g"
        );
        if (v250) {
          targetVariation = v250;
          break;
        }
      }
    }

    return {
      price: targetVariation?.price || product.price || product.regular_price,
      regular_price:
        targetVariation?.regular_price || product.regular_price,
      sale_price: targetVariation?.sale_price || product.sale_price,
      image:
        targetVariation?.image ||
        product.image ||
        product.images?.[0]?.src ||
        product.images?.[0],
    };
  };

  /* ---------------- CATEGORY RENDER ---------------- */
  function renderCategories(categories) {
    if (!categories?.length) return null;

    return categories.map((cat) => {
      const hasChildren = cat.children?.length > 0;

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

  /* ---------------- MOBILE CLICK OUTSIDE ---------------- */
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

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileFiltersOpen]);

  /* ---------------- LOADER ---------------- */
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

  /* ---------------- RENDER ---------------- */
  return (
    <div className={styles.main}>
      <div className={styles.MainContainer}>
        <div className={styles.LeftConatiner}>
          <div className={styles.LeftTop}>
            <p>Filter</p>
          </div>
          <div className={styles.LeftBottom}>
            {renderCategories(productsCategories)}
          </div>
        </div>

        <div className={styles.RightConatiner}>
          <div className={styles.RightBottom}>
            <div className={styles.ProductsGrid}>
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const displayData = getDisplayData(product);

                /* --------- SEO SLUG + ID --------- */
                const productSlug = product.tagline
                  ? slugify(`${product.name}-${product.tagline}`)
                  : slugify(product.name);
                const productUrl = `/products/${productSlug}-${product.id}`;

                return (
                  <div className={styles.ProductCard} key={product.id}>
                    <div className={styles.ProductTop}>
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
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                        }}
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
                            <p>
                              {product.tasting_notes_description}
                            </p>
                          </div>
                        </div>
                      </Link>

                      <div className={styles.ProductActions}>
                        <AddToCart product={{ product_id: product.id }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className={styles.LoadMore}>
                <button
                  className={styles.LoadMoreCta}
                  onClick={handleLoadMore}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lisiting;
