"use client";
import React, { useState, useEffect } from "react";
import styles from "./CuponsSideBar.module.css";
import { useCart } from "../../_context/CartContext";

const CuponsSideBar = ({ isOpen, onClose }) => {
  const { applyCoupon, cartTotals } = useCart();
  const [couponList, setCouponList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/website/cart/coupan/get");
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCouponList(data.coupons);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (code) => {
    if (!code) return;
    const res = await applyCoupon(code);
    if (res?.ok) {
      onClose();
      setInputCode("");
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.Main}>
        <div className={styles.Header}>
          <div className={styles.Back} onClick={onClose}>
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.654 11.3075L0 5.65375L5.654 0L6.70775 1.0845L2.8885 4.90375H15.404V6.40375H2.8885L6.70775 10.223L5.654 11.3075Z"
                fill="#2F362A"
              />
            </svg>
          </div>
          <div>
            <h3>COUPONS AND OFFERS</h3>
            <p>Cart value : AED {cartTotals?.total?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className={styles.InputWrap}>
          <input
            placeholder="Discount code or coupon"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button onClick={() => handleApply(inputCode)}>Apply</button>
        </div>

        <div className={styles.CouponsList}>
          <div className={styles.CouponsHeader}>
            <h4>Available Offers</h4>
          </div>
          {loading ? (
            <p style={{ padding: 20, textAlign: "center" }}>Loading coupons...</p>
          ) : (
            couponList.map((coupon, index) => (
              <div className={styles.CuponsCard} key={index}>
                <div className={styles.CuponsCardTop}>
                  <div className={styles.CuponsCardLeft}>
                    <div className={styles.CuponsCode}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.3787 5.25656L9.64074 5.30094L9.39096 12.5082L8.12892 12.4638L8.3787 5.25656ZM0.471243 8.58647L9.17869 0.403264C9.78277 -0.164446 10.7188 -0.131528 11.2821 0.477238L13.312 2.67099C13.0233 2.94228 12.8534 3.31802 12.8397 3.71556C12.8259 4.11309 12.9694 4.49986 13.2386 4.79077C13.5077 5.08167 13.8806 5.2529 14.275 5.26677C14.6695 5.28064 15.0533 5.13603 15.3419 4.86474L17.3719 7.05849C17.9352 7.66726 17.9025 8.61056 17.2984 9.17827L8.59097 17.3615C8.3023 17.6328 7.91852 17.7774 7.52406 17.7635C7.12959 17.7496 6.75676 17.5784 6.48758 17.2875L4.45764 15.0938C5.06172 14.526 5.09441 13.5827 4.53111 12.974C4.26192 12.6831 3.88909 12.5118 3.49462 12.498C3.10016 12.4841 2.71638 12.6287 2.42771 12.9L0.397779 10.7063C0.128593 10.4153 -0.0148943 10.0286 -0.00111701 9.63104C0.0126602 9.23351 0.182573 8.85776 0.471243 8.58647ZM1.48621 9.68335L2.77522 11.0764C3.28375 10.9578 3.8143 10.9762 4.31351 11.1298C4.81271 11.2835 5.26296 11.5669 5.61894 11.9516C5.97492 12.3363 6.22408 12.8088 6.34136 13.3213C6.45863 13.8339 6.43988 14.3686 6.287 14.8716L7.57601 16.2646L16.2834 8.08139L14.9944 6.68836C14.4859 6.80699 13.9554 6.78855 13.4562 6.6349C12.9569 6.48125 12.5067 6.19781 12.1507 5.8131C11.7947 5.42839 11.5456 4.95598 11.4283 4.4434C11.311 3.93081 11.3298 3.39614 11.4827 2.89317L10.1937 1.50014L1.48621 9.68335ZM5.49436 7.96725C5.94606 7.54274 6.6507 7.56752 7.07191 8.02273C7.49312 8.47793 7.46851 9.18806 7.01681 9.61256C6.56511 10.0371 5.86047 10.0123 5.43926 9.55708C5.01805 9.10188 5.04266 8.39175 5.49436 7.96725ZM10.7529 8.15218C11.2045 7.72768 11.9092 7.75246 12.3304 8.20766C12.7516 8.66287 12.727 9.37299 12.2753 9.79749C11.8236 10.222 11.119 10.1972 10.6978 9.74201C10.2765 9.28681 10.3012 8.57669 10.7529 8.15218Z"
                          fill="#2F362A"
                        />
                      </svg>

                      <h4>{coupon.code.toUpperCase()}</h4>
                    </div>

                    <div className={styles.CuponsSave}>
                      <h5>
                        {coupon.discount_type === "percent"
                          ? `Get ${Number(coupon.amount).toFixed(0)}% OFF`
                          : `Save AED ${Number(coupon.amount).toFixed(2)}`
                        }
                      </h5>
                    </div>

                    <div className={styles.CuponsDesc}>
                      <p>{coupon.description || "Apply this coupon at checkout"}</p>
                    </div>
                  </div>

                  <div className={styles.CuponsCardRight} onClick={() => handleApply(coupon.code)} style={{ cursor: "pointer" }}>
                    <h5>Apply now</h5>
                  </div>
                </div>

                <div className={styles.CuponsCardBottom}>
                  <p>Know more</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default CuponsSideBar;
