"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Lisiting.module.css";
import Image from "next/image";
import Wishlist from "../../../../_components/Whishlist";
import AddToCart from "../../../../_components/AddToCart";

const Lisiting = () => {
  const ITEMS_PER_LOAD = 9;
  const parent_id = "131";

  // State
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("Recommended");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [PRODUCTS, setProducts] = useState([]);
  const [PRODUCTS_CATEGORIES, setProductsCategories] = useState([]);
  const [open, setOpen] = useState({});
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const mobileFiltersRef = useRef(null);

  // 1. Initial Fetch: Categories only
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`/api/website/products/categories?parent_id=${parent_id}`);
        const json = await res.json();
        if (res.ok) {
          setProductsCategories(json.data);
          const initOpen = {};
          json.data.forEach(cat => { initOpen[cat.slug] = false; });
          setOpen(initOpen);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // 2. Filtered Fetch: Triggers when selected categories or sort changes
  useEffect(() => {
    async function fetchFilteredProducts() {
      try {
        // Map UI labels to API sort keys
        const sortMap = {
          "Latest to Oldest": "latest",
          "Oldest to Latest": "oldest",
          "Recommended": "latest"
        };

        // If no categories selected, use parent_id to show all
        const categoryParam = selected.length > 0 ? selected.join(",") : parent_id;
        const sortParam = sortMap[sortType] || "latest";

        const res = await fetch(
          `/api/website/products/categories?categories=${categoryParam}&sort=${sortParam}`
        );
        const json = await res.json();

        if (res.ok) {
          setProducts(json.data || []);
          setVisibleCount(ITEMS_PER_LOAD); // Reset pagination on new filter
        }
      } catch (err) {
        console.error("Error fetching filtered products:", err);
      }
    }

    fetchFilteredProducts();
  }, [selected, sortType]);

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
  };

  // Toggle selection in the array
  function handleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function renderCategories(categories, parentSlug = null) {
    if (!categories || !Array.isArray(categories) || categories.length === 0) return null;

    return categories.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;

      if (hasChildren) {
        return (
          <div key={cat.id} className={styles.FilterBox}>
            <div className={styles.FilterHeader} onClick={() => toggle(cat.slug)}>
              <h5>{cat.name}</h5>
              {open[cat.slug] ? <span>✕</span> : <span>▾</span>}
            </div>
            <div className={`${styles.AnimatedBox} ${open[cat.slug] ? styles.open : ""}`}>
              <div className={styles.FilterOptions}>
                {renderCategories(cat.children, cat.slug)}
              </div>
            </div>
          </div>
        );
      }

      return (
        <label key={cat.id}>
          <input
            type="checkbox"
            checked={selected.includes(cat.id)}
            onChange={() => handleSelect(cat.id)}
          />
          {cat.name}
        </label>
      );
    });
  }

  // Outside click for mobile filters
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileFiltersRef.current && !mobileFiltersRef.current.contains(e.target)) {
        setIsMobileFiltersOpen(false);
      }
    };
    if (isMobileFiltersOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileFiltersOpen]);
  // if (isLoading) {
  //   return (
  //     <div className={styles.LoaderWrapper}>
  //       <Image
  //         src="/White-mantis-green-loader.gif"
  //         alt="Loading products"
  //         width={120}
  //         height={120}
  //         unoptimized
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className={styles.main}>
      <div className={styles.MainContainer}>
        <div className={styles.LeftConatiner}>
          <div className={styles.LeftTop}><p>Filter</p></div>
          <div className={styles.LeftBottom}>
            {renderCategories(PRODUCTS_CATEGORIES)}
          </div>
        </div>

        <div className={styles.RightConatiner}>
          <div className={styles.RightTop}>
            <div className={styles.RightTopLeft}>
              <div className={styles.CatName}><h3>Coffee Capsules</h3></div>
              <div className={styles.CatCount}><p>({PRODUCTS?.length || 0} items)</p></div>
            </div>

            <div className={styles.RightTopRight}>
              <button
                  className={styles.MobileFilterBtn}
                  onClick={() => setIsMobileFiltersOpen(true)}
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.66667 8V6.66667H7.33333V8H4.66667ZM2 4.66667V3.33333H10V4.66667H2ZM0 1.33333V0H12V1.33333H0Z" fill="#6E736A"/>
              </svg>
              Filter
                </button>
              <div className={styles.SortBy}><p>Sort by:</p></div>
              <div className={styles.SortWrapper}>
                <div className={styles.SortOptions} onClick={() => setSortOpen((p) => !p)}>
                  <p>{sortType}</p>
                </div>
                {sortOpen && (
                  <div className={styles.SortDropdown}>
                    {["Recommended", "Latest to Oldest", "Oldest to Latest"].map((item) => (
                      <p key={item} onClick={() => { setSortType(item); setSortOpen(false); }}>
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
              {PRODUCTS.slice(0, visibleCount).map((product) => (
                <div className={styles.ProductCard} key={product.id}>
                  <div className={styles.ProductTop}>
                    <div className={styles.WishlistIcon}><Wishlist product={product} /></div>
                    <div className={styles.ProductImage}>
                      {product.image || (product.images && product.images[0]) ? (
                        <Image
                          src={product.image || product.images[0].src || product.images[0]}
                          alt={product.name}
                          width={300}
                          height={300}
                        />
                      ) : (
                        <div className={styles.NoImage}>No Image</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.ProductBottom}>
                    <div className={styles.ProductInfo}>
                      <div className={styles.ProductPrice}>
                        <h4>AED {product.price || product.regular_price}</h4>
                        {product.sale_price && product.sale_price !== product.regular_price && (
                          <p className={styles.OldPrice}>AED {product.regular_price}</p>
                        )}
                      </div>
                      <div className={styles.Line}></div>
                      <div className={styles.ProductName}>
                        <h3>{product.name}</h3>
                        <p>{product.slug}</p>
                      </div>
                    </div>
                    <div className={styles.ProductActions}>
                      <AddToCart product={product} />
                      <button className={styles.Subscribe}>Subscribe</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < PRODUCTS.length && (
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
              {renderCategories(PRODUCTS_CATEGORIES)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lisiting;