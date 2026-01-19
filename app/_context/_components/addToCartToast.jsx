"use client";

import toast from "react-hot-toast";
import Image from "next/image";
import styles from "./addToCartToast.module.css";

export const addToCartToast = (product, openCart) => {
  toast.custom(
    (t) => {
      // Check if the toast is currently visible
      const isVisible = t.visible;

      return (
        <div
          className={`${styles.toastContainer} ${
            isVisible ? styles.toastContainerVisible : styles.toastContainerExit
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className={styles.closeButton}
          >
            ×
          </button>

          {/* Title */}
          <h3 className={styles.title}>Added to cart</h3>

          {/* Product row */}
          <div className={styles.productRow}>
            <div className={styles.imageWrapper}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="64px"
                className={styles.productImage}
                priority
              />
            </div>

            <div className={styles.productInfo}>
              <p className={styles.productName}>{product.name}</p>
              <p className={styles.productQty}>Qty: {product.quantity}</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              toast.dismiss(t.id);
              // Use a small delay for the redirect so the user sees the button click
              openCart();
            }}
            className={styles.viewCartButton}
          >
            View Cart
          </button>
        </div>
      );
    },
    {
      duration: 4000,
      id: "cart-toast",
      position: "top-right",
    },
  );
};
