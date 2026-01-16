import React from "react";
import styles from "./Recommendation.module.css";
import Image from "next/image";
import primg from "./1.png";
import Wishlist from "../../../../_components/Whishlist";
import AddToCart from "../../../../_components/AddToCart";

const RECOMMENDATION_DATA = [
  {
    id: 1,
    cardClass: styles.RCardOne,
    price: "AED 65.00",
    oldPrice: "AED 65",
    title: "Indonesia Banner Mariah Triple Wet Hull",
    subtitle: "Citrus, nutty, chocolate",
    image: primg,
  },
  {
    id: 2,
    cardClass: styles.RCardTwo,
    price: "AED 65.00",
    oldPrice: "AED 65",
    title: "Indonesia Banner Mariah Triple Wet Hull",
    subtitle: "Citrus, nutty, chocolate",
    image: primg,
  },
  {
    id: 3,
    cardClass: styles.RCardThree,
    price: "AED 65.00",
    oldPrice: "AED 65",
    title: "Indonesia Banner Mariah Triple Wet Hull",
    subtitle: "Citrus, nutty, chocolate",
    image: primg,
  },
];

const Recommendation = () => {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.Top}>
            <h3>YOU MAY ALSO LIKE</h3>
          </div>

          <div className={styles.Bottom}>
            <div className={styles.BottomTop}>
              {RECOMMENDATION_DATA.map((item) => (
                <div className={item.cardClass} key={item.id}>
                  <div className={styles.RCardTop}>
                    <div className={styles.WishlistIcon}>
                      <Wishlist />
                    </div>

                    <div className={styles.ProductImage}>
                      <Image src={item.image} alt="Product Image" />
                    </div>
                  </div>

                  <div className={styles.RCardInfo}>
                    <div className={styles.RCardPricing}>
                      <h4>{item.price}</h4>
                      <p>{item.oldPrice}</p>
                    </div>

                    <div className={styles.Line}></div>

                    <div className={styles.RCardTitle}>
                      <h4>{item.title}</h4>
                      <p>{item.subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.RCardBottom}>
                    <AddToCart />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.BottomBottom}>
              <button className={styles.Exploremore}>
                Explore more
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Recommendation;
