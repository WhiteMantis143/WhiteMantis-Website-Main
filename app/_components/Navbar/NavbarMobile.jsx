"use client";
import React, { useState } from "react";
import styles from "./NavbarMobile.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import Logo from "./11.png";
const Logo = "/White-mantis-animated-logo.gif";
import { useCart } from "../../_context/CartContext";
import { useSession } from "next-auth/react";

const NavbarMobile = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(true);
  const { isCartOpen, openCart, closeCart } = useCart();
  const { data: session, status } = useSession();

  return (
    <>
      {/* update the links here also dont't forgeet */}
      <div className={styles.Navbar}>
        <button className={styles.IconBtn} onClick={() => setOpen(true)}>
          <svg
            width="24"
            height="16"
            viewBox="0 0 24 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0H24V2.66667H0V0ZM0 6.66667H24V9.33333H0V6.66667ZM0 13.3333H24V16H0V13.3333Z"
              fill="#6C7A5F"
            />
          </svg>
        </button>

        <Link href="/">
          <Image
            src={Logo}
            alt="White Mantis Logo"
            width={170}
            height={78}
            unoptimized
          />
        </Link>

        <button
          className={`${styles.IconBtn} ${
            pathname === "/cart" ? styles.active : ""
          }`}
          onClick={() => (isCartOpen ? closeCart() : openCart())}
          style={{ cursor: "pointer" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "auto", height: "24px" }}
          >
            <path
              d="M12.8 12.8C13.2243 12.8 13.6313 12.9686 13.9314 13.2686C14.2314 13.5687 14.4 13.9757 14.4 14.4C14.4 14.8243 14.2314 15.2313 13.9314 15.5314C13.6313 15.8314 13.2243 16 12.8 16C12.3757 16 11.9687 15.8314 11.6686 15.5314C11.3686 15.2313 11.2 14.8243 11.2 14.4C11.2 13.512 11.912 12.8 12.8 12.8ZM0 0H2.616L3.368 1.6H15.2C15.4122 1.6 15.6157 1.68429 15.7657 1.83431C15.9157 1.98434 16 2.18783 16 2.4C16 2.536 15.96 2.672 15.904 2.8L13.04 7.976C12.768 8.464 12.24 8.8 11.64 8.8H5.68L4.96 10.104L4.936 10.2C4.936 10.253 4.95707 10.3039 4.99458 10.3414C5.03209 10.3789 5.08296 10.4 5.136 10.4H14.4V12H4.8C4.37565 12 3.96869 11.8314 3.66863 11.5314C3.36857 11.2313 3.2 10.8243 3.2 10.4C3.2 10.12 3.272 9.856 3.392 9.632L4.48 7.672L1.6 1.6H0V0ZM4.8 12.8C5.22435 12.8 5.63131 12.9686 5.93137 13.2686C6.23143 13.5687 6.4 13.9757 6.4 14.4C6.4 14.8243 6.23143 15.2313 5.93137 15.5314C5.63131 15.8314 5.22435 16 4.8 16C4.37565 16 3.96869 15.8314 3.66863 15.5314C3.36857 15.2313 3.2 14.8243 3.2 14.4C3.2 13.512 3.912 12.8 4.8 12.8ZM12 7.2L14.224 3.2H4.112L6 7.2H12Z"
              fill="#6C7A5F"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className={styles.MenuWrapper}>
          <div className={styles.MenuHeader}>
            <button className={styles.IconBtn} onClick={() => setOpen(false)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.6 16L0 14.4L6.4 8L0 1.6L1.6 0L8 6.4L14.4 0L16 1.6L9.6 8L16 14.4L14.4 16L8 9.6L1.6 16Z"
                  fill="#6C7A5F"
                />
              </svg>
            </button>

            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src={Logo}
                alt="White Mantis Logo"
                width={170}
                height={78}
                unoptimized
              />
            </Link>

            <button
              className={styles.IconBtn}
              onClick={() => {
                setOpen(false);
                openCart();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.8 12.8C13.2243 12.8 13.6313 12.9686 13.9314 13.2686C14.2314 13.5687 14.4 13.9757 14.4 14.4C14.4 14.8243 14.2314 15.2313 13.9314 15.5314C13.6313 15.8314 13.2243 16 12.8 16C12.3757 16 11.9687 15.8314 11.6686 15.5314C11.3686 15.2313 11.2 14.8243 11.2 14.4C11.2 13.512 11.912 12.8 12.8 12.8ZM0 0H2.616L3.368 1.6H15.2C15.4122 1.6 15.6157 1.68429 15.7657 1.83431C15.9157 1.98434 16 2.18783 16 2.4C16 2.536 15.96 2.672 15.904 2.8L13.04 7.976C12.768 8.464 12.24 8.8 11.64 8.8H5.68L4.96 10.104L4.936 10.2C4.936 10.253 4.95707 10.3039 4.99458 10.3414C5.03209 10.3789 5.08296 10.4 5.136 10.4H14.4V12H4.8C4.37565 12 3.96869 11.8314 3.66863 11.5314C3.36857 11.2313 3.2 10.8243 3.2 10.4C3.2 10.12 3.272 9.856 3.392 9.632L4.48 7.672L1.6 1.6H0V0ZM4.8 12.8C5.22435 12.8 5.63131 12.9686 5.93137 13.2686C6.23143 13.5687 6.4 13.9757 6.4 14.4C6.4 14.8243 6.23143 15.2313 5.93137 15.5314C5.63131 15.8314 5.22435 16 4.8 16C4.37565 16 3.96869 15.8314 3.66863 15.5314C3.36857 15.2313 3.2 14.8243 3.2 14.4C3.2 13.512 3.912 12.8 4.8 12.8ZM12 7.2L14.224 3.2H4.112L6 7.2H12Z"
                  fill="#6C7A5F"
                />
              </svg>
            </button>
          </div>

          <div className={styles.MenuContent}>
            <div className={styles.Section}>
              <button
                className={styles.SectionHeader}
                onClick={() => setShopOpen(!shopOpen)}
              >
                Our Shop
                {/* <Image
                  src="/Icons/keyboard_arrow.svg"
                  className={shopOpen ? styles.Rotate : ""}
                  alt="Drop Icon"
                  width={20}
                  height={20}
                  style={{
                    width: "14px",
                    height: "auto",
                    transition: "all 0.2s ease-out",
                  }}
                /> */}
                <svg
                  className={shopOpen ? styles.Rotate : ""}
                  width="14"
                  height="9"
                  viewBox="0 0 14 9"
                >
                  <path
                    d="M7 0L0 7L1.30466 8.30469L7 2.60935L12.6953 8.30469L14 7L7 0Z"
                    fill="#2F362A"
                  />
                </svg>
              </button>

              {shopOpen && (
                <>
                  <div className={styles.Line}></div>
                  <div className={styles.TwoCol}>
                    <div className={styles.Columnvee}>
                      <Link
                        href="/shop/coffee-beans"
                        onClick={() => setOpen(false)}
                        className={styles.subLinks}
                      >
                        Coffee beans
                      </Link>
                      <Link
                        href="/shop/coffee-dripbags"
                        onClick={() => setOpen(false)}
                        className={styles.subLinks}
                      >
                        Coffee Drip bags
                      </Link>
                      <Link
                        href="/shop/coffee-capsules"
                        onClick={() => setOpen(false)}
                        className={styles.subLinks}
                      >
                        Coffee Capsules
                      </Link>
                    </div>
                    {/* <div className={styles.Columnvee}>
                    <Link href="/shop/merchandise">Merchandise</Link>
                    <Link href="/shop/equipment">Equipments</Link>
                  </div> */}
                  </div>
                </>
              )}
            </div>
            <div className={styles.Line}></div>
            <Link
              className={styles.SectionHeader}
              href="/about-us"
              onClick={() => setOpen(false)}
            >
              About Us
            </Link>
            <div className={styles.Line}></div>
            {/* <Link className={styles.Item} href="/workshops">
              Workshops
            </Link> */}
            {/* <Link className={styles.Item} href="/subscription">
              Subscriptions
            </Link> */}
            <Link
              className={styles.SectionHeader}
              href="/wholesale"
              onClick={() => setOpen(false)}
            >
              Wholesale
            </Link>
            <div className={styles.Line}></div>
            <Link
              className={styles.SectionHeader}
              href="/contact"
              onClick={() => setOpen(false)}
            >
              Contact us
            </Link>
            <div className={styles.Line}></div>
            {/* <Link className={styles.Item} href="/blogs">
              Blogs
            </Link> */}

            {session ? (
              <div className={styles.Section}>
                <button
                  className={styles.SectionHeader}
                  onClick={() => setAccountOpen(!accountOpen)}
                >
                  Account
                  <svg
                    className={accountOpen ? styles.Rotate : ""}
                    width="14"
                    height="9"
                    viewBox="0 0 14 9"
                  >
                    <path
                      d="M7 0L0 7L1.30466 8.30469L7 2.60935L12.6953 8.30469L14 7L7 0Z"
                      fill="#2F362A"
                    />
                  </svg>
                </button>

                <div className={styles.Line}></div>

                {accountOpen && (
                  <div className={styles.Column}>
                    <Link
                      href="/account/profile"
                      onClick={() => setOpen(false)}
                      className={styles.subLinks}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setOpen(false)}
                      className={styles.subLinks}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account/subscription"
                      onClick={() => setOpen(false)}
                      className={styles.subLinks}
                    >
                      Manage Subscription
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setOpen(false)}
                      className={styles.subLinks}
                    >
                      Wishlist
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                className={styles.SectionHeader}
                href="/auth"
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarMobile;
