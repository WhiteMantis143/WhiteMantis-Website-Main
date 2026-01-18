"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";
const Logo = "/White-Mantis-White-Logo.svg";

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [newsletterError, setNewsletterError] = useState(false);
  if (pathname.startsWith("/auth")) {
    return null;
  }
  return (
    <>
      {/* chnge link path with crct one later veer dont forget */}
      <div className={styles.Main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <div className={styles.TopLeft}>
              <Link href="/">
                <Image
                  src={Logo}
                  alt="White Mantis Logo"
                  width={170}
                  height={78}
                  className={styles.LogoImage}
                />
              </Link>
            </div>

            <div className={styles.TopMiddle}>
              <div className={styles.MobOne}>
                <div className={styles.TopMiddleOne}>
                  <div className={styles.TopMiddleOneTop}>
                    <h4>Company</h4>
                  </div>
                  <div className={styles.TopMiddleOneBottom}>
                    <Link href="/about-us">
                      <p>About us</p>
                    </Link>
                    {/* <Link href="/workshop">
                      <p>Workshop</p>
                    </Link>
                    <Link href="/subscription">
                      <p>Subscription</p>
                    </Link>
                    <Link href="/blogs">
                      <p>Blogs</p>
                    </Link>
                    <Link href="/careers">
                      <p>Careers</p>
                    </Link> */}
                    <Link href="/wholesale">
                      <p>Wholesale</p>
                    </Link>
                    <Link href="/contact">
                      <p>Contact Us</p>
                    </Link>
                  </div>
                </div>

                <div className={styles.TopMiddleTwo}>
                  <div className={styles.TopMiddleTwoTop}>
                    <h4>Shop</h4>
                  </div>
                  <div className={styles.TopMiddleTwoBottom}>
                    <Link href="/shop/coffee-beans">
                      <p>Coffee Beans</p>
                    </Link>
                    <Link href="/shop/capsules">
                      <p>Coffee Capsules</p>
                    </Link>
                    <Link href="/shop/drip-bags">
                      <p>Coffee Drip Bags</p>
                    </Link>
                    {/* <Link href="/shop/merchandise">
                      <p>Merchandise</p>
                    </Link>
                    <Link href="/shop/equipment">
                      <p>Equipment</p>
                    </Link> */}
                  </div>
                </div>
              </div>

              <div className={styles.MobTwo}>
                <div className={styles.TopMiddleThree}>
                  <div className={styles.TopMiddleThreeTop}>
                    <h4>Account</h4>
                  </div>
                  <div className={styles.TopMiddleThreeBottom}>
                    <Link href="/account/profile">
                      <p>Profile</p>
                    </Link>
                    <Link href="/account/orders">
                      <p>Orders</p>
                    </Link>
                    <Link href="/account/wishlist">
                      <p>Whishlist</p>
                    </Link>
                    {/* <Link href="/subscription/manage">
                      <p>Manage Subscription</p>
                    </Link> */}
                  </div>
                </div>

                {/* <div className={styles.TopMiddleFour}>
                  <div className={styles.TopMiddleFourTop}>
                    <h4>Support</h4>
                  </div>
                  <div className={styles.TopMiddleFourBottom}>
                    <Link href="/wholesale">
                      <p>Wholesale</p>
                    </Link>
                    <Link href="/contact">
                      <p>Contact Us</p>
                    </Link>
                  </div>
                </div> */}
              </div>
            </div>

            <div className={styles.TopRight}>
            <div className={styles.TopRightTop} id="join-community">
                <div className={styles.NewslHeading}>
                  <h4>Join Our Community</h4>
                </div>
                <div className={styles.NewsLetter}>
                  <div className={styles.NewsLetterRow}>
                    <input
                      type="email"
                      placeholder="Email address"
                      className={styles.NewsLetterInput}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <button
                      className={styles.SubscribeButton}
                      disabled={loading}
                      onClick={async () => {
                        if (!email) {
                          setNewsletterError(true);
                          setNewsletterMsg(
                            "Please enter a valid email address."
                          );
                          return;
                        }

                        setLoading(true);
                        setNewsletterMsg("");
                        setNewsletterError(false);

                        try {
                          const res = await fetch("/api/website/newsletter", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email,
                              name: "",
                              source: "footer",
                            }),
                          });

                          const data = await res.json();

                          if (res.ok && data.success) {
                            setNewsletterError(false);
                            setNewsletterMsg("Subscribed successfully!");
                            setEmail("");
                          } else {
                            setNewsletterError(true);
                            setNewsletterMsg(
                              data.message || "Subscription failed."
                            );
                          }
                        } catch (err) {
                          setNewsletterError(true);
                          setNewsletterMsg("Network error. Please try again.");
                        } finally {
                          setLoading(false);
                          setTimeout(() => setNewsletterMsg(""), 4000);
                        }
                      }}
                    >
                      {loading ? "Subscribing..." : "Subscribe"}
                    </button>
                  </div>

                  {newsletterMsg && (
                    <p
                      className={
                        newsletterError
                          ? styles.NewsletterError
                          : styles.NewsletterSuccess
                      }
                    >
                      {newsletterMsg}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.TopRightMiddle}>
                <div className={styles.Phone}>
                  <p style={{ fontWeight: "bold" }}>Phone</p>
                  <Link href="tel:+971589535337">
                    <p>+971 - 05 8953 5337</p>
                  </Link>
                </div>
                <div className={styles.Email}>
                  <p style={{ fontWeight: "bold" }}>Email</p>
                  <Link href="mailto:hello@whitemantis.ae">
                    <p>hello@whitemantis.ae</p>
                  </Link>
                </div>
              </div>

              <div className={styles.Address}>
                <p>Our Store</p>
                <p>
                  Warehouse #2 - 26 <br />
                  26th St - Al Qouz Ind.fourth, Al Quoz, Dubai
                </p>
              </div>

              <div className={styles.TopRightBottomMobile}>
                <Link href="/terms-and-conditions">
                  <p>Terms and Conditions</p>
                </Link>
                <Link href="/privacy-policy">
                  <p>Privacy Policy</p>
                </Link>
                 <div className={styles.Socials}>
                  <a
                    href="https://www.instagram.com/whitemantis.ae?igsh=cHl5NnQ3ZDY4OGNt"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p>Instagram</p>
                  </a>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.354342 7.58134L7.36212 0.501629M7.36212 0.501629V6.87337M7.36212 0.501629H1.05512"
                      stroke="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.Bottom}>
            <div className={styles.line}></div>
            <div className={styles.BottomBottom}>
              <div className={styles.BottomBottomLeft}>
                <p>© 2026 White Mantis</p>
              </div>

              <div className={styles.BottomBottomMiddle}>
                <div className={styles.TandC}>
                  <Link href="/terms-and-conditions">
                    <p>Terms and Conditions</p>
                  </Link>
                </div>
                <div className={styles.PrivacyPolicy}>
                  <Link href="/privacy-policy">
                    <p>Privacy Policy</p>
                  </Link>
                </div>
                <div className={styles.Socials}>
                  <a
                    href="https://www.instagram.com/whitemantis.ae?igsh=cHl5NnQ3ZDY4OGNt"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p>Instagram</p>
                  </a>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.354342 7.58134L7.36212 0.501629M7.36212 0.501629V6.87337M7.36212 0.501629H1.05512"
                      stroke="white"
                    />
                  </svg>
                </div>
              </div>

              <div className={styles.BottomBottomRight}>
                <p>
                  Crafted by{" "}
                  <Link
                    href="https://integramagna.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.IM}
                  >
                    Integra Magna
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
