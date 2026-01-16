"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
const Logo = "/White-mantis-animated-logo.gif";
import { useSession } from "next-auth/react";
import { useCart } from "../../_context/CartContext";

const Navbar = () => {
  const pathname = usePathname();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef(null);
  const { isCartOpen, openCart, closeCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      setIsScrollingDown(
        currentPosition > scrollPosition && currentPosition > 50
      );
      setScrollPosition(currentPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.Main} ${isScrollingDown ? styles.hide : ""}`}>
      <div className={styles.MainCoantiner}>
        <div className={styles.Left}>
          <div className={styles.LogoContainer}>
            <Link href="/">
              <Image
                src={Logo}
                alt="White Mantis Logo"
                width={170}
                height={78}
                unoptimized
              />
            </Link>
          </div>

          <div className={styles.PageslInks}>
            <div
              className={styles.OurShopWrapper}
              ref={dropdownRef}
              onMouseEnter={() => setShopOpen(true)}
            >
              <div
                className={`${styles.OurShops} ${
                  pathname.startsWith("/shop") ? styles.active : ""
                }`}
                onClick={() => setShopOpen((prev) => !prev)}
              >
                <p>Our Shop</p>
                <svg
                  className={`${styles.Arrow} ${
                    shopOpen ? styles.ArrowOpen : ""
                  }`}
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                  fill="none"
                >
                  <path
                    d="M3.89844 0L7.79555 4.5H0.00132322L3.89844 0Z"
                    fill="#6E736A"
                  />
                </svg>
              </div>

              <div
                className={styles.DummyMain}
                style={{ display: shopOpen ? "block" : "none" }}
              >
                <div className={styles.DummyMainCoantiner}>
                  <div className={styles.DummyLeft}>
                    <div className={styles.DummyLeftOne}>
                      <h3>OUR Shop</h3>
                      <p>
                        From home brewing to bulk supply, discover coffee and
                        equipment made to perform.
                      </p>
                    </div>

                    <div className={styles.DummyLine}></div>

                    <div className={styles.DummyLeftTwo}>
                      <div className={styles.DummyLeftTwoLeft}>
                        <div className={styles.DummyLeftTwoLeftTop}>
                          <h4>Coffee</h4>
                        </div>
                        <div className={styles.DummyLeftTwoLeftBottom}>
                          <Link href="/shop/coffee-beans">
                            <p>Coffee Beans</p>
                          </Link>
                          <Link href="/shop/coffee-dripbags">
                            <p>Coffee Drip bags</p>
                          </Link>
                          <Link href="/shop/coffee-capsules">
                            <p>Coffee Capsules</p>
                          </Link>
                        </div>
                      </div>

                      {/* <div className={styles.DummyLeftTwoRight}>
                        <div className={styles.DummyLeftTwoRightTop}>
                          <h4>Essentials</h4>
                        </div>
                        <div className={styles.DummyLeftTwoRightBottom}>
                          <Link href="/shop/merchandise"><p>Merchandise</p></Link>
                          <Link href="/shop/equipment"><p>Equipments</p></Link>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <div className={styles.DummyRight}>
                    <div className={styles.DummyRightOne}>
                      <div className={styles.DummyRightOneTop}>
                        <h4>Seasonal Release</h4>
                        <p>
                          Indonesia Banner Mariah Triple Wet Hull Citrus, nutty,
                          chocolate
                        </p>
                      </div>
                      <div className={styles.DummyRightOneBottom}>
                        <Link href="/shop/coffee-beans">
                          <button className={styles.DummyExplore}>
                            Explore
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* <div className={styles.DummyRightTwo}>
                      <div className={styles.DummyRightTwoTop}>
                        <h4>Subscription</h4>
                        <p>Coffee to your door</p>
                      </div>
                      <div className={styles.DummyRightTwoBottom}>
                        <Link href="/subscription">
                          <button className={styles.DummyTwoExplore}>
                            Explore
                          </button>
                        </Link>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/about-us"
              className={pathname === "/about-us" ? styles.active : ""}
            >
              <div className={styles.AboutUspg}>
                <p>About Us</p>
              </div>
            </Link>
            <Link
              href="/wholesale"
              className={pathname === "/wholesale" ? styles.active : ""}
            >
              <div className={styles.AboutUspg}>
                <p>Wholesale</p>
              </div>
            </Link>

            {/* <Link
              href="/workshops"
              className={pathname === "/workshops" ? styles.active : ""}
            >
              <div className={styles.Workshopspg}>
                <p>Workshops</p>
              </div>
            </Link> */}

            {/* <Link
              href="/subscription"
              className={pathname === "/subscription" ? styles.active : ""}
            >
              <div className={styles.Subscriptionpg}>
                <p>Subscription</p>
              </div>
            </Link> */}
          </div>
        </div>

        <div className={styles.Right}>
          <Link
            href="/contact"
            className={pathname === "/contact" ? styles.active : ""}
          >
            <p>Contact Us</p>
          </Link>

          {/* <Link
            href="/blogs"
            className={pathname === "/blogs" ? styles.active : ""}
          >
            <p>Blogs</p>
          </Link> */}

          <Link
            href=""
            onClick={() => (isCartOpen ? closeCart() : openCart())}
            className={pathname === "/cart" ? styles.active : ""}
            style={{ cursor: "pointer" }}
          >
            <p>Cart</p>
          </Link>
          {session && (
            <Link
              href="/account"
              className={pathname.startsWith("/account") ? styles.active : ""}
              style={{ cursor: "pointer" }}
            >
              <p>Account</p>
            </Link>
          )}
          {!session && (
            <Link
              href="/auth"
              className={pathname.startsWith("/auth") ? styles.active : ""}
              style={{ cursor: "pointer" }}
            >
              <p>Get Started</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
