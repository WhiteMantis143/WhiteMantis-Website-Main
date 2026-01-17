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
                    <h5>Shop now</h5>
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
              <div className={styles.Two}>
                <div className={styles.TwoTop}>
                  <div className={styles.TwoTopTop}>
                    <h4>02</h4>
                    <h4>Coffee Drips</h4>
                  </div>
                  <div className={styles.TwoTopBottom}>
                    <p>
                      Single-serve drip bags designed for easy, no-equipment
                      brewing. Enjoy a balanced, clean cup anywhere, just add
                      hot water and brew with ease.
                    </p>
                    <h5>Shop now</h5>
                  </div>
                </div>
                <div className={styles.TwoBottom}>
                  <Image src={two} alt="sample" />
                </div>
              </div>
            </Link>
            <Link
              href="/shop/coffee-capsules"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.Three}>
                <div className={styles.ThreeTop}>
                  <div className={styles.ThreeTopTop}>
                    <h4>03</h4>
                    <h4>Coffee Capsules</h4>
                  </div>
                  <div className={styles.ThreeTopBottom}>
                    <p>
                      Precision-packed capsules crafted for consistent
                      extraction and smooth flavor. Perfect for quick,
                      effortless coffee without compromising on quality.
                    </p>
                    <h5>Shop now</h5>
                  </div>
                </div>

                <div className={styles.ThreeBottom}>
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
