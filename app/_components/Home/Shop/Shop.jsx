import React from "react";
import styles from "./Shop.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";
import three from "./3.png";
import Link from "next/link";

const Shop = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <h3>Shop BY Category</h3>
          </div>
          <div className={styles.Botttom}>
            <Link
              href="/shop/coffee-beans"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.One}>
                <div className={styles.OneTop}>
                  <div className={styles.OneTopTop}>
                    <h4>01</h4>
                    <h4>Coffee Beans</h4>
                  </div>
                  <div className={styles.OneTopBottom}>
                    <p>
                      Freshly roasted specialty beans crafted for balance and
                      clarity. Designed for consistent performance across
                      espresso and filter brewing.
                    </p>
                    <div className={styles.arrowextra}>
                      <h5>Shop now</h5>
                      <svg
                        width="13"
                        height="14"
                        viewBox="0 0 13 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.9941 12.1425H10.9951V3.45074L1.40959 13.1543L0.000253677 11.7276L9.58574 2.02405H0.999784V0.000364304H12.9941V12.1425Z"
                          fill="#6C7A5F"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={styles.OneBottom}>
                  <Image src={one} alt="sample" />
                </div>
              </div>
            </Link>
            <Link
              href="/shop/coffee-dripbags"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.One}>
                <div className={styles.OneTop}>
                  <div className={styles.OneTopTop}>
                    <h4>02</h4>
                    <h4>Coffee Drips</h4>
                  </div>
                  <div className={styles.OneTopBottom}>
                    <p>
                      Single-serve drip bags designed for easy, no-equipment
                      brewing. Enjoy a balanced, clean cup anywhere, just add
                      hot water and brew with ease.
                    </p>
                    <div className={styles.arrowextra}>
                      <h5>Shop now</h5>
                      <svg
                        width="13"
                        height="14"
                        viewBox="0 0 13 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.9941 12.1425H10.9951V3.45074L1.40959 13.1543L0.000253677 11.7276L9.58574 2.02405H0.999784V0.000364304H12.9941V12.1425Z"
                          fill="#6C7A5F"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className={styles.OneBottom}>
                  <Image src={two} alt="sample" />
                </div>
              </div>
            </Link>
            <Link
              href="/shop/coffee-capsules"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.One}>
                <div className={styles.OneTop}>
                  <div className={styles.OneTopTop}>
                    <h4>03</h4>
                    <h4>Coffee Capsules</h4>
                  </div>
                  <div className={styles.OneTopBottom}>
                    <p>
                      Precision-packed capsules crafted for consistent
                      extraction and smooth flavor. Perfect for quick,
                      effortless coffee without compromising on quality.
                    </p>
                    <div className={styles.arrowextra}>
                      <h5>Shop now</h5>
                      <svg
                        width="13"
                        height="14"
                        viewBox="0 0 13 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.9941 12.1425H10.9951V3.45074L1.40959 13.1543L0.000253677 11.7276L9.58574 2.02405H0.999784V0.000364304H12.9941V12.1425Z"
                          fill="#6C7A5F"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.OneBottom}>
                  <Image src={three} alt="sample" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
