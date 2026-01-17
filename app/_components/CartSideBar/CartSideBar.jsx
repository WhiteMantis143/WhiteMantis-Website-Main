"use client";

import styles from "./CartSideBar.module.css";
import { useCart } from "../../_context/CartContext";
import Image from "next/image";
import CuponsSideBar from "../CuponsSideBar/CuponsSideBar";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { cleanProductName } from "../../../lib/productUtils";

const CartSideBar = () => {
  const {
    isCartOpen,
    closeCart,
    products,
    addItem,
    removeItem,
    cartTotals,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    loading,
  } = useCart();

  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();
  const isCartEmpty = products.length === 0;


  const handleIncrease = async (product_id, variation_id) => {
    await addItem(product_id, 1, { variation_id });
  };

  const handleDecrease = async (product_id, variation_id, currentQty) => {
    if (currentQty > 1) {
      await addItem(product_id, -1, { variation_id });
    }
  };

  const handleRemove = async (product_id, variation_id) => {
    await removeItem(product_id, variation_id);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }
    const result = await applyCoupon(couponCode);
    if (result.ok) {
      setCouponCode("");
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout?mode=cart");
  };

  console.log(products);

  return (
    <>
      {(isCartOpen || isCouponsOpen) && (
        <div
          className={styles.overlay}
          onClick={() => {
            if (isCouponsOpen) {
              setIsCouponsOpen(false);
            } else {
              closeCart();
            }
          }}
        />
      )}

      <aside className={`${styles.sidebar} ${isCartOpen ? styles.open : ""}`}>
        <div className={styles.Main}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <div
                onClick={closeCart}
                style={{
                  position: "absolute",
                  top: "30px",
                  right: "40px",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                    fill="#6C7A5F"
                  />
                </svg>
              </div>
              <Image
                src="/White-mantis-green-loader.gif"
                alt="Loading..."
                width={100}
                height={100}
                unoptimized
              />
            </div>
          ) : (
            <div className={styles.MainContainer}>
              <div className={styles.Top}>
                <div className={styles.TopOne}>
                  <div className={styles.TopOneTop}>
                    <div className={styles.TopOneLeft}>
                      <h4>Your Cart </h4>
                      <p>({products.length} items)</p>
                    </div>
                    <div className={styles.TopOneRight} onClick={closeCart}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                          fill="#6C7A5F"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.TopOneBottom}>
                    {products.map((item) => (
                      <div
                        className={styles.Card}
                        key={`${item.product_id}-${item.variation_id || 0}`}
                      >
                        <div className={styles.CardLeft}>
                          <div className={styles.ProdImage}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={100}
                              height={100}
                            />
                          </div>
                          <div className={styles.ProdDetails}>
                            <h5>
                              {cleanProductName(item.name)}
                              {item.attributes?.attribute_pa_weight
                                ? ` - ${item.attributes.attribute_pa_weight}`
                                : ""}
                            </h5>
                            <h4>
                              AED{" "}
                              {(
                                item.price?.final_price ||
                                item.price ||
                                0
                              ).toFixed(2)}
                            </h4>
                          </div>
                        </div>

                        <div className={styles.CardRight}>
                          <div className={styles.QuantitySelector}>
                            <button
                              className={styles.qtyBtn}
                              onClick={() =>
                                handleDecrease(
                                  item.product_id,
                                  item.variation_id,
                                  item.quantity
                                )
                              }
                            >
                              -
                            </button>

                            <span className={styles.qtyValue}>
                              {String(item.quantity).padStart(2, "0")}
                            </span>

                            <button
                              className={styles.qtyBtn}
                              onClick={() =>
                                handleIncrease(
                                  item.product_id,
                                  item.variation_id
                                )
                              }
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.RemoveItem}>
                            <button
                              onClick={() =>
                                handleRemove(item.product_id, item.variation_id)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.TopTwo}>
                  <div className={styles.TopTwoTop}>
                    <h3>coupons and offers</h3>
                  </div>
                  <div className={styles.TopTwoBottom}>
                    {appliedCoupon ? (
                      <div className={styles.AppliedCoupon}>
                        <div className={styles.AppliedCouponLeft}>
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 19 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.5 19C9.1385 19 8.79408 18.9324 8.46675 18.7973C8.13925 18.6621 7.84908 18.4668 7.59625 18.2115C7.09358 17.7153 6.6625 17.3907 6.303 17.2375C5.94333 17.0843 5.40392 17.0077 4.68475 17.0077C3.93675 17.0077 3.301 16.746 2.7775 16.2225C2.254 15.699 1.99225 15.0632 1.99225 14.3152C1.99225 13.6026 1.91542 13.0646 1.76175 12.7013C1.60808 12.3379 1.28367 11.9054 0.7885 11.4038C0.530833 11.1461 0.335 10.8538 0.201 10.527C0.067 10.2002 0 9.8585 0 9.502C0 9.1455 0.067 8.80317 0.201 8.475C0.335 8.14683 0.530833 7.85392 0.7885 7.59625C1.28367 7.09808 1.60808 6.66867 1.76175 6.308C1.91542 5.94717 1.99225 5.40608 1.99225 4.68475C1.99225 3.93675 2.254 3.301 2.7775 2.7775C3.301 2.254 3.93675 1.99225 4.68475 1.99225C5.39742 1.99225 5.93542 1.91542 6.29875 1.76175C6.66208 1.60808 7.09458 1.28367 7.59625 0.788499C7.84958 0.533166 8.14017 0.337916 8.468 0.20275C8.79583 0.067583 9.13858 0 9.49625 0C9.85392 0 10.1968 0.0669995 10.525 0.200999C10.8532 0.334999 11.1461 0.530833 11.4038 0.788499C11.9019 1.28367 12.3313 1.60808 12.692 1.76175C13.0528 1.91542 13.5939 1.99225 14.3152 1.99225C15.0632 1.99225 15.699 2.254 16.2225 2.7775C16.746 3.301 17.0077 3.93675 17.0077 4.68475C17.0077 5.39742 17.0846 5.93542 17.2383 6.29875C17.3919 6.66208 17.7163 7.09458 18.2115 7.59625C18.4692 7.85392 18.665 8.14617 18.799 8.473C18.933 8.79983 19 9.1415 19 9.498C19 9.8545 18.933 10.1968 18.799 10.525C18.665 10.8532 18.4692 11.1461 18.2115 11.4038C17.7153 11.9064 17.3907 12.3375 17.2375 12.697C17.0843 13.0567 17.0077 13.5961 17.0077 14.3152C17.0077 15.0632 16.746 15.699 16.2225 16.2225C15.699 16.746 15.0632 17.0077 14.3152 17.0077C13.6026 17.0077 13.0646 17.0846 12.7013 17.2383C12.3379 17.3919 11.9054 17.7163 11.4038 18.2115C11.1509 18.4668 10.8608 18.6621 10.5333 18.7973C10.2059 18.9324 9.8615 19 9.5 19ZM9.50125 17.5C9.65942 17.5 9.81383 17.4677 9.9645 17.403C10.1152 17.3382 10.2418 17.2545 10.3443 17.152C10.9763 16.5135 11.5735 16.0798 12.136 15.851C12.6983 15.6222 13.4247 15.5078 14.3152 15.5078C14.6531 15.5078 14.9363 15.3935 15.165 15.165C15.3935 14.9363 15.5078 14.6531 15.5078 14.3152C15.5078 13.4192 15.6222 12.693 15.851 12.1365C16.0798 11.5802 16.5103 10.9827 17.1423 10.3442C17.3808 10.1058 17.5 9.82433 17.5 9.5C17.5 9.17567 17.384 8.89742 17.152 8.66525C16.5135 8.02692 16.0798 7.4265 15.851 6.864C15.6222 6.30167 15.5078 5.57525 15.5078 4.68475C15.5078 4.34692 15.3935 4.06367 15.165 3.835C14.9363 3.6065 14.6531 3.49225 14.3152 3.49225C13.4099 3.49225 12.6802 3.37942 12.126 3.15375C11.5718 2.92792 10.9748 2.49592 10.3348 1.85775C10.2321 1.75508 10.1054 1.66983 9.95475 1.602C9.80408 1.534 9.6525 1.5 9.5 1.5C9.3475 1.5 9.19433 1.53475 9.0405 1.60425C8.8865 1.67392 8.75825 1.75842 8.65575 1.85775C8.02375 2.48975 7.4265 2.92017 6.864 3.149C6.30167 3.37783 5.57525 3.49225 4.68475 3.49225C4.34692 3.49225 4.06367 3.6065 3.835 3.835C3.6065 4.06367 3.49225 4.34692 3.49225 4.68475C3.49225 5.58725 3.37783 6.31667 3.149 6.873C2.92017 7.4295 2.4865 8.02692 1.848 8.66525C1.616 8.89742 1.5 9.17567 1.5 9.5C1.5 9.82433 1.616 10.1058 1.848 10.3442C2.4865 10.9827 2.92017 11.5812 3.149 12.1395C3.37783 12.6978 3.49225 13.4231 3.49225 14.3152C3.49225 14.6531 3.6065 14.9363 3.835 15.165C4.06367 15.3935 4.34692 15.5078 4.68475 15.5078C5.58792 15.5078 6.31592 15.6222 6.86875 15.851C7.42158 16.0798 8.02042 16.5135 8.66525 17.152C8.76792 17.2545 8.89333 17.3382 9.0415 17.403C9.18983 17.4677 9.34308 17.5 9.50125 17.5ZM11.9345 13.1635C12.2795 13.1635 12.5706 13.0449 12.8077 12.8077C13.0449 12.5706 13.1635 12.2795 13.1635 11.9345C13.1635 11.5893 13.0449 11.296 12.8077 11.0545C12.5706 10.813 12.2795 10.6923 11.9345 10.6923C11.5893 10.6923 11.296 10.813 11.0545 11.0545C10.813 11.296 10.6923 11.5893 10.6923 11.9345C10.6923 12.2795 10.813 12.5706 11.0545 12.8077C11.296 13.0449 11.5893 13.1635 11.9345 13.1635ZM7.01725 13.027L13.027 7.027L11.973 5.973L5.973 11.9827L7.01725 13.027ZM7.0655 8.30775C7.41067 8.30775 7.704 8.187 7.9455 7.9455C8.187 7.704 8.30775 7.41067 8.30775 7.0655C8.30775 6.7205 8.187 6.42942 7.9455 6.19225C7.704 5.95508 7.41067 5.8365 7.0655 5.8365C6.7205 5.8365 6.42942 5.95508 6.19225 6.19225C5.95508 6.42942 5.8365 6.7205 5.8365 7.0655C5.8365 7.41067 5.95508 7.704 6.19225 7.9455C6.42942 8.187 6.7205 8.30775 7.0655 8.30775Z"
                              fill="#6E736A"
                            />
                          </svg>
                          <p>Coupon Applied: {appliedCoupon.code}</p>
                        </div>
                        <button
                          className={styles.RemoveCoupon}
                          onClick={removeCoupon}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className={styles.CouponInput}>
                        <input
                          type="text"
                          placeholder="Discount code or coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleApplyCoupon()
                          }
                        />
                        <button
                          className={styles.Apply}
                          onClick={handleApplyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    <div
                      className={styles.AvailableCoupons}
                      style={{ backgroundColor: "#2F362A1A" }}
                    >
                      <div className={styles.AvailableCouponsLeft}>
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 19 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.5 19C9.1385 19 8.79408 18.9324 8.46675 18.7973C8.13925 18.6621 7.84908 18.4668 7.59625 18.2115C7.09358 17.7153 6.6625 17.3907 6.303 17.2375C5.94333 17.0843 5.40392 17.0077 4.68475 17.0077C3.93675 17.0077 3.301 16.746 2.7775 16.2225C2.254 15.699 1.99225 15.0632 1.99225 14.3152C1.99225 13.6026 1.91542 13.0646 1.76175 12.7013C1.60808 12.3379 1.28367 11.9054 0.7885 11.4038C0.530833 11.1461 0.335 10.8538 0.201 10.527C0.067 10.2002 0 9.8585 0 9.502C0 9.1455 0.067 8.80317 0.201 8.475C0.335 8.14683 0.530833 7.85392 0.7885 7.59625C1.28367 7.09808 1.60808 6.66867 1.76175 6.308C1.91542 5.94717 1.99225 5.40608 1.99225 4.68475C1.99225 3.93675 2.254 3.301 2.7775 2.7775C3.301 2.254 3.93675 1.99225 4.68475 1.99225C5.39742 1.99225 5.93542 1.91542 6.29875 1.76175C6.66208 1.60808 7.09458 1.28367 7.59625 0.788499C7.84958 0.533166 8.14017 0.337916 8.468 0.20275C8.79583 0.067583 9.13858 0 9.49625 0C9.85392 0 10.1968 0.0669995 10.525 0.200999C10.8532 0.334999 11.1461 0.530833 11.4038 0.788499C11.9019 1.28367 12.3313 1.60808 12.692 1.76175C13.0528 1.91542 13.5939 1.99225 14.3152 1.99225C15.0632 1.99225 15.699 2.254 16.2225 2.7775C16.746 3.301 17.0077 3.93675 17.0077 4.68475C17.0077 5.39742 17.0846 5.93542 17.2383 6.29875C17.3919 6.66208 17.7163 7.09458 18.2115 7.59625C18.4692 7.85392 18.665 8.14617 18.799 8.473C18.933 8.79983 19 9.1415 19 9.498C19 9.8545 18.933 10.1968 18.799 10.525C18.665 10.8532 18.4692 11.1461 18.2115 11.4038C17.7153 11.9064 17.3907 12.3375 17.2375 12.697C17.0843 13.0567 17.0077 13.5961 17.0077 14.3152C17.0077 15.0632 16.746 15.699 16.2225 16.2225C15.699 16.746 15.0632 17.0077 14.3152 17.0077C13.6026 17.0077 13.0646 17.0846 12.7013 17.2383C12.3379 17.3919 11.9054 17.7163 11.4038 18.2115C11.1509 18.4668 10.8608 18.6621 10.5333 18.7973C10.2059 18.9324 9.8615 19 9.5 19ZM9.50125 17.5C9.65942 17.5 9.81383 17.4677 9.9645 17.403C10.1152 17.3382 10.2418 17.2545 10.3443 17.152C10.9763 16.5135 11.5735 16.0798 12.136 15.851C12.6983 15.6222 13.4247 15.5078 14.3152 15.5078C14.6531 15.5078 14.9363 15.3935 15.165 15.165C15.3935 14.9363 15.5078 14.6531 15.5078 14.3152C15.5078 13.4192 15.6222 12.693 15.851 12.1365C16.0798 11.5802 16.5103 10.9827 17.1423 10.3442C17.3808 10.1058 17.5 9.82433 17.5 9.5C17.5 9.17567 17.384 8.89742 17.152 8.66525C16.5135 8.02692 16.0798 7.4265 15.851 6.864C15.6222 6.30167 15.5078 5.57525 15.5078 4.68475C15.5078 4.34692 15.3935 4.06367 15.165 3.835C14.9363 3.6065 14.6531 3.49225 14.3152 3.49225C13.4099 3.49225 12.6802 3.37942 12.126 3.15375C11.5718 2.92792 10.9748 2.49592 10.3348 1.85775C10.2321 1.75508 10.1054 1.66983 9.95475 1.602C9.80408 1.534 9.6525 1.5 9.5 1.5C9.3475 1.5 9.19433 1.53475 9.0405 1.60425C8.8865 1.67392 8.75825 1.75842 8.65575 1.85775C8.02375 2.48975 7.4265 2.92017 6.864 3.149C6.30167 3.37783 5.57525 3.49225 4.68475 3.49225C4.34692 3.49225 4.06367 3.6065 3.835 3.835C3.6065 4.06367 3.49225 4.34692 3.49225 4.68475C3.49225 5.58725 3.37783 6.31667 3.149 6.873C2.92017 7.4295 2.4865 8.02692 1.848 8.66525C1.616 8.89742 1.5 9.17567 1.5 9.5C1.5 9.82433 1.616 10.1058 1.848 10.3442C2.4865 10.9827 2.92017 11.5812 3.149 12.1395C3.37783 12.6978 3.49225 13.4231 3.49225 14.3152C3.49225 14.6531 3.6065 14.9363 3.835 15.165C4.06367 15.3935 4.34692 15.5078 4.68475 15.5078C5.58792 15.5078 6.31592 15.6222 6.86875 15.851C7.42158 16.0798 8.02042 16.5135 8.66525 17.152C8.76792 17.2545 8.89333 17.3382 9.0415 17.403C9.18983 17.4677 9.34308 17.5 9.50125 17.5ZM11.9345 13.1635C12.2795 13.1635 12.5706 13.0449 12.8077 12.8077C13.0449 12.5706 13.1635 12.2795 13.1635 11.9345C13.1635 11.5893 13.0449 11.296 12.8077 11.0545C12.5706 10.813 12.2795 10.6923 11.9345 10.6923C11.5893 10.6923 11.296 10.813 11.0545 11.0545C10.813 11.296 10.6923 11.5893 10.6923 11.9345C10.6923 12.2795 10.813 12.5706 11.0545 12.8077C11.296 13.0449 11.5893 13.1635 11.9345 13.1635ZM7.01725 13.027L13.027 7.027L11.973 5.973L5.973 11.9827L7.01725 13.027ZM7.0655 8.30775C7.41067 8.30775 7.704 8.187 7.9455 7.9455C8.187 7.704 8.30775 7.41067 8.30775 7.0655C8.30775 6.7205 8.187 6.42942 7.9455 6.19225C7.704 5.95508 7.41067 5.8365 7.0655 5.8365C6.7205 5.8365 6.42942 5.95508 6.19225 6.19225C5.95508 6.42942 5.8365 6.7205 5.8365 7.0655C5.8365 7.41067 5.95508 7.704 6.19225 7.9455C6.42942 8.187 6.7205 8.30775 7.0655 8.30775Z"
                            fill="#6E736A"
                          />
                        </svg>
                        <p>More offers</p>
                      </div>
                      <div
                        className={styles.AvailableCouponsRight}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCouponsOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <p>View all coupons</p>
                        <svg
                          width="10"
                          height="16"
                          viewBox="0 0 10 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.17612 16L0 14.8239L6.82388 8L0 1.17612L1.17612 0L9.17612 8L1.17612 16Z"
                            fill="#6E736A"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.Bottom}>
                <div className={styles.BottomOne}>
                  <h3>Price details</h3>
                </div>
                <div className={styles.BottomTwo}>
                  <div className={styles.BottomDetails}>
                    <div className={styles.BottomDetailsTop}>
                      <div className={styles.BottomDetailsLeft}>
                        <h5>Subtotal</h5>
                      </div>
                      <div className={styles.BottomDetailsRight}>
                        <h4>AED {cartTotals.subtotal.toFixed(2)}</h4>
                      </div>
                    </div>
                    <div className={styles.BottomDetailsBottom}>
                      <div className={styles.BottomDetailsLeft}>
                        <h5>Coupon Discount</h5>
                      </div>
                      <div className={styles.BottomDetailsRight}>
                        <h4>AED {cartTotals.discount.toFixed(2)}</h4>
                      </div>
                    </div>
                  </div>
                  <div className={styles.Line}></div>
                  <div
                    className={styles.PriceDetails}
                    style={{
                      borderTop: "1px solid #2F362A4D",
                      paddingTop: "10px",
                    }}
                  >
                    <div className={styles.PriceDetailLeft}>
                      <h5>Total</h5>
                    </div>
                    <div className={styles.PriceDetailRight}>
                      <h4>AED {cartTotals.total.toFixed(2)}</h4>
                    </div>
                  </div>
                 <button
  className={styles.CheckOutCta}
  onClick={() => !isCartEmpty && handleCheckout()}
  disabled={isCartEmpty}
  style={{
    opacity: isCartEmpty ? 0.5 : 1,
    cursor: isCartEmpty ? "not-allowed" : "pointer",
  }}
>
                    Checkout
                  </button>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#6E736A",
                      marginTop: "0px",
                    }}
                  >
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
      <CuponsSideBar
        isOpen={isCouponsOpen}
        onClose={() => setIsCouponsOpen(false)}
      />
    </>
  );
};

export default CartSideBar;
