"use client";

import React, { useState, useRef, useEffect } from "react";

import styles from "./Lisiting.module.css";
import Image from "next/image";
import one from "./1.png";
import Wishlist from "../../../_components/Whishlist";
import AddToCart from "../../../_components/AddToCart";

const PRODUCTS = [
  {
    id: 1,
    price: "AED 65.00",
    oldPrice: "AED 75",
    name: "Indonesia Banner Mariah Triple Wet Hull",
    desc: "Citrus, nutty, chocolate",
    image: one,
  },
  {
    id: 2,
    price: "AED 58.00",
    oldPrice: "AED 70",
    name: "Ethiopia Yirgacheffe Washed",
    desc: "Floral, lemon, tea-like",
    image: one,
  },
  {
    id: 3,
    price: "AED 72.00",
    oldPrice: "AED 85",
    name: "Colombia Huila Supremo",
    desc: "Caramel, red apple, cocoa",
    image: one,
  },
  {
    id: 4,
    price: "AED 60.00",
    oldPrice: "AED 68",
    name: "Brazil Santos Natural",
    desc: "Nutty, chocolate, low acidity",
    image: one,
  },
  {
    id: 5,
    price: "AED 69.00",
    oldPrice: "AED 80",
    name: "Kenya AA Washed",
    desc: "Blackcurrant, citrus, bright",
    image: one,
  },
  {
    id: 6,
    price: "AED 62.00",
    oldPrice: "AED 72",
    name: "Guatemala Antigua",
    desc: "Spice, cocoa, balanced",
    image: one,
  },
  {
    id: 7,
    price: "AED 55.00",
    oldPrice: "AED 65",
    name: "Mexico Chiapas",
    desc: "Chocolate, almond, mild",
    image: one,
  },
  {
    id: 8,
    price: "AED 74.00",
    oldPrice: "AED 88",
    name: "Panama Geisha",
    desc: "Jasmine, bergamot, honey",
    image: one,
  },
  {
    id: 9,
    price: "AED 59.00",
    oldPrice: "AED 70",
    name: "Peru Organic Washed",
    desc: "Brown sugar, cocoa, smooth",
    image: one,
  },
  {
    id: 10,
    price: "AED 68.00",
    oldPrice: "AED 78",
    name: "Rwanda Bourbon",
    desc: "Stone fruit, caramel",
    image: one,
  },
  {
    id: 11,
    price: "AED 63.00",
    oldPrice: "AED 74",
    name: "Costa Rica Tarrazú",
    desc: "Citrus, toffee, clean",
    image: one,
  },
  {
    id: 12,
    price: "AED 34.00",
    oldPrice: "AED 82",
    name: "Honduras Marcala",
    desc: "Sweet, cocoa, balanced",
    image: one,
  },
];

const Lisiting = () => {
  const ITEMS_PER_LOAD = 9;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState("Recommended");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const mobileFiltersRef = useRef(null);

  const [open, setOpen] = useState({
    category: true,
    brew: true,
    tasting: true,
    origin: true,
    process: true,
    price: true,
  });

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileFiltersRef.current &&
        !mobileFiltersRef.current.contains(event.target)
      ) {
        setIsMobileFiltersOpen(false);
      }
    };

    if (isMobileFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileFiltersOpen]);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.LeftConatiner}>
            <div className={styles.LeftTop}>
              <p>Filter</p>
            </div>

            <div className={styles.LeftBottom}>
              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("category")}
                >
                  <h5>Category</h5>
                  {open.category ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.category ? styles.open : ""
                    }`}
                >
                  <div className={styles.FilterOptions}>
                    <label>
                      <input type="checkbox" /> Co-fermented
                    </label>
                    <label>
                      <input type="checkbox" /> Exclusive
                    </label>
                    <label>
                      <input type="checkbox" /> Regular
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("brew")}
                >
                  <h5>Brew method</h5>
                  {open.brew ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.brew ? styles.open : ""
                    }`}
                >
                  <div className={styles.FilterOptions}>
                    <label>
                      <input type="checkbox" /> Filter
                    </label>
                    <label>
                      <input type="checkbox" /> Espresso
                    </label>
                    <label>
                      <input type="checkbox" /> Milk
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("tasting")}
                >
                  <h5>Tasting profile</h5>
                  {open.tasting ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.tasting ? styles.open : ""
                    }`}
                >
                  <div className={styles.FilterOptions}>
                    <label>
                      <input type="checkbox" /> Chocolate and Nutty
                    </label>
                    <label>
                      <input type="checkbox" /> Fruity and Sweet
                    </label>
                    <label>
                      <input type="checkbox" /> Floral and Citrus
                    </label>
                    <label>
                      <input type="checkbox" /> Complex and Exotic
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("origin")}
                >
                  <h5>Origin</h5>
                  {open.origin ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.origin ? styles.open : ""
                    }`}
                >
                  <div className={styles.FilterOptions}>
                    <label>
                      <input type="checkbox" /> Brazil
                    </label>
                    <label>
                      <input type="checkbox" /> Colombia
                    </label>
                    <label>
                      <input type="checkbox" /> Costa Rica
                    </label>
                    <label>
                      <input type="checkbox" /> Ethiopia
                    </label>
                    <label>
                      <input type="checkbox" /> El Salvador
                    </label>
                    <label>
                      <input type="checkbox" /> Indonesia
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("process")}
                >
                  <h5>Process</h5>
                  {open.process ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.process ? styles.open : ""
                    }`}
                >
                  <div className={styles.FilterOptions}>
                    <label>
                      <input type="checkbox" /> Natural
                    </label>
                    <label>
                      <input type="checkbox" /> Washed
                    </label>
                    <label>
                      <input type="checkbox" /> Co-fermentation
                    </label>
                    <label>
                      <input type="checkbox" /> Anaerobic
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.FilterBox}>
                <div
                  className={styles.FilterHeader}
                  onClick={() => toggle("price")}
                >
                  <h5>Price</h5>
                  {open.price ? <span>✕</span> : <span>▾</span>}
                </div>

                <div
                  className={`${styles.AnimatedBox} ${open.price ? styles.open : ""
                    }`}
                >
                  <div className={styles.PriceBox}>
                    <input type="range" min="0" max="200" />
                    <div className={styles.PriceInputs}>
                      <div>
                        <input placeholder="AED" />
                        <p>Min. Price</p>
                      </div>
                      <div>
                        <input placeholder="AED" />
                        <p>Max. Price</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.RightConatiner}>
            <div className={styles.RightTop}>
              <div className={styles.RightTopLeft}>
                <div className={styles.CatName}>
                  <h3>Coffee Beans</h3>
                </div>
                <div className={styles.CatCount}>
                  <p>({PRODUCTS.length} items)</p>
                </div>
              </div>

              <div className={styles.RightTopRight}>
                <button
                  className={styles.MobileFilterBtn}
                  onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_2844_14323"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="16"
                      height="16"
                    >
                      <rect width="16" height="16" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_2844_14323)">
                      <path
                        d="M6.66667 12V10.6667H9.33333V12H6.66667ZM4 8.66667V7.33333H12V8.66667H4ZM2 5.33333V4H14V5.33333H2Z"
                        fill="#6E736A"
                      />
                    </g>
                  </svg>
                  <p>Filters</p>
                </button>

                <div className={styles.SortBy}>
                  <p>Sort by:</p>
                </div>

                <div className={styles.SortWrapper}>
                  <div
                    className={styles.SortOptions}
                    onClick={() => setSortOpen((p) => !p)}
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
                {[...PRODUCTS]
                  .sort((a, b) => {
                    if (sortType === "Latest to Oldest") return b.id - a.id;
                    if (sortType === "Oldest to Latest") return a.id - b.id;
                    return 0;
                  })
                  .slice(0, visibleCount)
                  .map((product) => (
                    <div className={styles.ProductCard} key={product.id}>
                      <div className={styles.ProductTop}>
                        <div className={styles.WishlistIcon}>
                          <Wishlist />
                        </div>
                        <div className={styles.ProductImage}>
                          <Image src={product.image} alt="Product Image" />
                        </div>
                      </div>

                      <div className={styles.ProductBottom}>
                        <div className={styles.ProductInfo}>
                          <div className={styles.ProductPrice}>
                            <h4>{product.price}</h4>
                            <p>{product.oldPrice}</p>
                          </div>

                          <div className={styles.Line}></div>

                          <div className={styles.ProductName}>
                            <h3>{product.name}</h3>
                            <p>{product.desc}</p>
                          </div>
                        </div>

                        <div className={styles.ProductActions}>
                          <AddToCart />
                          <button className={styles.Subscribe}>
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {visibleCount < PRODUCTS.length && (
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

          {isMobileFiltersOpen && (
            <div className={styles.MobileFilters} ref={mobileFiltersRef}>
              <div className={styles.MobileFilterHeader}>
                <p>Filters</p>
                <span onClick={() => setIsMobileFiltersOpen(false)}>✕</span>
              </div>
              <div className={styles.LeftBottom}>
                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("category")}
                  >
                    <h5>Category</h5>
                    {open.category ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.category ? styles.open : ""
                      }`}
                  >
                    <div className={styles.FilterOptions}>
                      <label>
                        <input type="checkbox" /> Co-fermented
                      </label>
                      <label>
                        <input type="checkbox" /> Exclusive
                      </label>
                      <label>
                        <input type="checkbox" /> Regular
                      </label>
                    </div>
                  </div>
                </div>

                {/* BREW */}
                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("brew")}
                  >
                    <h5>Brew method</h5>
                    {open.brew ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.brew ? styles.open : ""
                      }`}
                  >
                    <div className={styles.FilterOptions}>
                      <label>
                        <input type="checkbox" /> Filter
                      </label>
                      <label>
                        <input type="checkbox" /> Espresso
                      </label>
                      <label>
                        <input type="checkbox" /> Milk
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("tasting")}
                  >
                    <h5>Tasting profile</h5>
                    {open.tasting ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.tasting ? styles.open : ""
                      }`}
                  >
                    <div className={styles.FilterOptions}>
                      <label>
                        <input type="checkbox" /> Chocolate and Nutty
                      </label>
                      <label>
                        <input type="checkbox" /> Fruity and Sweet
                      </label>
                      <label>
                        <input type="checkbox" /> Floral and Citrus
                      </label>
                      <label>
                        <input type="checkbox" /> Complex and Exotic
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("origin")}
                  >
                    <h5>Origin</h5>
                    {open.origin ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.origin ? styles.open : ""
                      }`}
                  >
                    <div className={styles.FilterOptions}>
                      <label>
                        <input type="checkbox" /> Brazil
                      </label>
                      <label>
                        <input type="checkbox" /> Colombia
                      </label>
                      <label>
                        <input type="checkbox" /> Costa Rica
                      </label>
                      <label>
                        <input type="checkbox" /> Ethiopia
                      </label>
                      <label>
                        <input type="checkbox" /> El Salvador
                      </label>
                      <label>
                        <input type="checkbox" /> Indonesia
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("process")}
                  >
                    <h5>Process</h5>
                    {open.process ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.process ? styles.open : ""
                      }`}
                  >
                    <div className={styles.FilterOptions}>
                      <label>
                        <input type="checkbox" /> Natural
                      </label>
                      <label>
                        <input type="checkbox" /> Washed
                      </label>
                      <label>
                        <input type="checkbox" /> Co-fermentation
                      </label>
                      <label>
                        <input type="checkbox" /> Anaerobic
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.FilterBox}>
                  <div
                    className={styles.FilterHeader}
                    onClick={() => toggle("price")}
                  >
                    <h5>Price</h5>
                    {open.price ? <span>✕</span> : <span>▾</span>}
                  </div>

                  <div
                    className={`${styles.AnimatedBox} ${open.price ? styles.open : ""
                      }`}
                  >
                    <div className={styles.PriceBox}>
                      <input type="range" min="0" max="200" />
                      <div className={styles.PriceInputs}>
                        <div>
                          <input placeholder="AED" />
                          <p>Min. Price</p>
                        </div>
                        <div>
                          <input placeholder="AED" />
                          <p>Max. Price</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Lisiting;
