import React from "react";
import styles from "./BrewingEquipment.module.css";
import Image from "next/image";
import one from "./1.png";
import two from "./2.png";

const EQUIPMENT_DATA = [
  {
    id: 1,
    title: "French Press",
    image: one,
    description:
      "This Olive wood coffee press range is a classic, exquisite way of brewing the perfect cup of coffee.",
    price: "AED 250",
  },
  {
    id: 2,
    title: "French Press",
    image: two,
    description:
      "This Olive wood coffee press range is a classic, exquisite way of brewing the perfect cup of coffee.",
    price: "AED 250",
  },
];

const BrewingEquipment = () => {
  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <h3>Pair with Essential Brewing Equipment</h3>
          </div>

          <div className={styles.Bottom}>
            <div className={styles.BottomTop}>
              {EQUIPMENT_DATA.map((item) => (
                <div className={styles.Card} key={item.id}>
                  <div className={styles.CardTitle}>
                    <h3>{item.title}</h3>
                  </div>

                  <div className={styles.CardDetails}>
                    <div className={styles.CardImage}>
                      <Image src={item.image} alt={item.title} />
                    </div>

                    <div className={styles.CardInfo}>
                      <div className={styles.CardDesc}>
                        <p>{item.description}</p>
                      </div>

                      <div className={styles.CardPrice}>
                        <h4>{item.price}</h4>
                      </div>
                    </div>
                  </div>

                  <div className={styles.CardMoreButton}>
                    <button className={styles.More}>More Details</button>

                    <div className={styles.MobilePrice}>
                      <h4>{item.price}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.BottomBottom}>
              <button className={styles.EXplore}>Explore more</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrewingEquipment;
