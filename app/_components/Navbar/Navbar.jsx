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
  const closeShopDropdown = () => {
    setShopOpen(false);
  };

  const pathname = usePathname();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef(null);
  const { isCartOpen, openCart, closeCart, items } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      setIsScrollingDown(
        currentPosition > scrollPosition && currentPosition > 50,
      );
      setScrollPosition(currentPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShopOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShopOpen(false);
    }, 200);
  };

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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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
                className={`${styles.DummyMain} ${
                  shopOpen ? styles.DummyMainOpen : ""
                }`}
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
                          <Link
                            href="/shop/coffee-beans"
                            onClick={closeShopDropdown}
                          >
                            <p>Coffee Beans</p>
                          </Link>
                          <Link
                            href="/shop/coffee-dripbags"
                            onClick={closeShopDropdown}
                          >
                            <p>Coffee Drip bags</p>
                          </Link>
                          <Link
                            href="/shop/coffee-capsules"
                            onClick={closeShopDropdown}
                          >
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

            <Link
              href="/subscription"
              className={pathname === "/subscription" ? styles.active : ""}
            >
              <div className={styles.Subscriptionpg}>
                <p>Subscription</p>
              </div>
            </Link>
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
            <p>
              Cart
              {items.length > 0 && (
                <span
                  style={{
                    color: "#6c7a5f",
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  ({items.length})
                </span>
              )}
            </p>
          </Link>
          {session && (
            <Link
              href="/account"
              className={pathname.startsWith("/account") ? styles.active : ""}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {session?.user?.profile_image?.url || session?.user?.image ? (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    position: "relative",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #6b7b5c",
                    boxShadow: pathname.startsWith("/account")
                      ? "0 0 0 2px #6b7b5c"
                      : "none",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <Image
                    src={
                      session?.user?.profile_image?.url || session?.user?.image
                    }
                    alt="Profile"
                    fill
                    sizes="32px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <p>Account</p>
              )}
            </Link>
          )}
          {!session && (
            <Link
              href="/auth"
              className={pathname.startsWith("/auth") ? styles.active : ""}
              style={{ cursor: "pointer" }}
            >
              <p>Login/SignUp</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
