"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import one from "./1.png"; // Fallback image

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || searchParams.get("order_id");
  const type = searchParams.get("type") || "order"; // 'order' or 'subscription'
  const token = searchParams.get("token"); // Guest access token

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let endpoint = type === 'subscription'
          ? `/api/website/subscription/${id}`
          : `/api/website/order/${id}`;

        // Add token to endpoint if present (for guest users)
        if (token) {
          endpoint += `?token=${encodeURIComponent(token)}`;
        }

        const res = await fetch(endpoint);
        const json = await res.json();

        if (json.success) {
          setData(json);
        } else {
          setError(json.message || "Failed to fetch details");
        }
      } catch (err) {
        setError("An error occurred while loading details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, token]);

  if (loading) {
    return (
      <div className={styles.Main}>
        <div style={{ textAlign: "center", padding: "50px" }}>Loading details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.Main}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h3>{error || "Order not found"}</h3>
        </div>
      </div>
    );
  }

  // Map Data based on type
  // Assuming 'order' structure mostly for now as per checkout redirect
  const order = type === 'subscription' ? data.subscription : data.order;

  // Helpers
  const formatAddress = (addr) => {
    if (!addr) return "N/A";
    // WC Address Object: address_1, address_2, city, state, postcode, country
    const parts = [
      addr.address_1,
      addr.address_2,
      addr.city,
      addr.state,
      addr.country,
      addr.postcode
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getPaymentMethod = () => {
    // Prefer Stripe details if available
    if (data.paymentDetails?.payment_method_details?.card) {
      const card = data.paymentDetails.payment_method_details.card;
      return `${card.brand.toUpperCase()} **** ${card.last4}`;
    }
    // Fallback to WC data
    return order.payment_method_title || "Credit Card";
  };

  const items = type === 'subscription'
    ? [{
      id: order.product_id,
      name: order.product_name,
      quantity: order.quantity || 1,
      price: order.total, // For sub, implies recurring? Or signup?
      image: null // Sub object might not have image
    }]
    : order.line_items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.total, // Total for line
      image: item.image?.src || null // Try to get image if available
    }));

  const orderInfo = {
    orderId: order.id,
    paymentMethod: getPaymentMethod(),
    billingAddress: formatAddress(order.billing),
    shippingAddress: formatAddress(order.shipping),
    email: order.billing?.email || "N/A",
  };

  const totals = {
    subtotal: parseFloat(order.total) - parseFloat(order.total_tax) - parseFloat(order.shipping_total), // Approx
    shipping: parseFloat(order.shipping_total),
    discount: parseFloat(order.discount_total),
    tax: parseFloat(order.total_tax),
    total: parseFloat(order.total)
  };

  // Correction on Subtotal: WC 'total' is final.
  // Ideally fetch subtotal from API but calculate: Total - Tax - Shipping + Discount = Subtotal (gross of discount usually? actually WC stores subtotal)
  // But strictly: order.total = (Subtotal - Discount) + Tax + Shipping
  // So Subtotal = Total - Tax - Shipping + Discount.

  const calcSubtotal = (parseFloat(order.total) - parseFloat(order.total_tax) - parseFloat(order.shipping_total) + parseFloat(order.discount_total)).toFixed(2);

  return (
    <div className={styles.Main}>
      <div className={styles.MainConatiner}>
        <div className={styles.Left}>
          <div className={styles.LeftTop}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM10.823 14.14L8.058 11.373L7 12.431L10.119 15.552C10.3065 15.7395 10.5608 15.8448 10.826 15.8448C11.0912 15.8448 11.3455 15.7395 11.533 15.552L17.485 9.602L16.423 8.54L10.823 14.14Z"
                fill="#428B54"
              />
            </svg>
            <h3>Thankyou for your purchase!</h3>
          </div>

          <div className={styles.LeftMiddle}>
            <div className={styles.LeftMiddleTop}>
              <h4>Your order is confirmed.</h4>
              <p>
                We ve received your payment.You will receive a order
                confirmation email soon.
              </p>
            </div>

            <div className={styles.LeftMiddleBottom}>
              <div className={styles.One}>
                <div className={styles.OneTop}>
                  <p>Order details</p>
                </div>

                <div className={styles.OneBottom}>
                  <div className={styles.OneBottomLeft}>
                    <div className={styles.OrderText}>
                      <p>Order Id</p>
                    </div>
                    <div className={styles.OrderIdNumber}>
                      <h4>{orderInfo.orderId}</h4>
                    </div>
                  </div>

                  <div className={styles.OneBottomRight}>
                    <div className={styles.PaymentText}>
                      <p>Payment Method</p>
                    </div>
                    <div className={styles.PaymentMethodCard}>
                      <svg
                        width="16"
                        height="12"
                        viewBox="0 0 16 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.9818 0H1.01818C0.748143 0 0.489165 0.113461 0.298219 0.315424C0.107272 0.517386 0 0.791305 0 1.07692V10.9231C0 11.2087 0.107272 11.4826 0.298219 11.6846C0.489165 11.8865 0.748143 12 1.01818 12H14.9818C15.2519 12 15.5108 11.8865 15.7018 11.6846C15.8927 11.4826 16 11.2087 16 10.9231V1.07692C16 0.791305 15.8927 0.517386 15.7018 0.315424C15.5108 0.113461 15.2519 0 14.9818 0ZM1.01818 0.923077H14.9818C15.0204 0.923077 15.0574 0.939286 15.0847 0.968137C15.1119 0.996989 15.1273 1.03612 15.1273 1.07692V3.07692H0.872727V1.07692C0.872727 1.03612 0.888052 0.996989 0.91533 0.968137C0.942608 0.939286 0.979605 0.923077 1.01818 0.923077ZM14.9818 11.0769H1.01818C0.979605 11.0769 0.942608 11.0607 0.91533 11.0319C0.888052 11.003 0.872727 10.9639 0.872727 10.9231V4H15.1273V10.9231C15.1273 10.9639 15.1119 11.003 15.0847 11.0319C15.0574 11.0607 15.0204 11.0769 14.9818 11.0769ZM13.6727 9.07692C13.6727 9.19933 13.6268 9.31673 13.5449 9.40328C13.4631 9.48984 13.3521 9.53846 13.2364 9.53846H10.9091C10.7934 9.53846 10.6824 9.48984 10.6005 9.40328C10.5187 9.31673 10.4727 9.19933 10.4727 9.07692C10.4727 8.95452 10.5187 8.83712 10.6005 8.75057C10.6824 8.66401 10.7934 8.61539 10.9091 8.61539H13.2364C13.3521 8.61539 13.4631 8.66401 13.5449 8.75057C13.6268 8.83712 13.6727 8.95452 13.6727 9.07692ZM9.01818 9.07692C9.01818 9.19933 8.97221 9.31673 8.89037 9.40328C8.80854 9.48984 8.69755 9.53846 8.58182 9.53846H7.41818C7.30245 9.53846 7.19146 9.48984 7.10963 9.40328C7.02779 9.31673 6.98182 9.19933 6.98182 9.07692C6.98182 8.95452 7.02779 8.83712 7.10963 8.75057C7.19146 8.66401 7.30245 8.61539 7.41818 8.61539H8.58182C8.69755 8.61539 8.80854 8.66401 8.89037 8.75057C8.97221 8.83712 9.01818 8.95452 9.01818 9.07692Z"
                          fill="#6E736A"
                        />
                      </svg>

                      <h4>{orderInfo.paymentMethod}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.Two}>
                <div className={styles.TwoLeft}>
                  <div className={styles.TwoLeftHeading}>
                    <p>Billing Address</p>
                  </div>
                  <div className={styles.BillingAddress}>
                    <p>{orderInfo.billingAddress}</p>
                  </div>
                </div>

                <div className={styles.TwoRight}>
                  <div className={styles.TwoRightHeading}>
                    <p>Shipping Address</p>
                  </div>
                  <div className={styles.ShippingAddress}>
                    <p>{orderInfo.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div className={styles.Three}>
                <div className={styles.ThreeTop}>
                  <p>Contact Information</p>
                </div>
                <div className={styles.ContactEmail}>
                  <p>{orderInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.LeftBottom}>
            <a href="/shop" style={{ textDecoration: 'none' }}>
              <button className={styles.cont}>Continue Shopping</button>
            </a>
          </div>
        </div>

        <div className={styles.Line}></div>

        <div className={styles.Right}>
          <div className={styles.RightOne}>
            <h3>Order Summary</h3>
            <p>({items.length} items)</p>
          </div>

          <div className={styles.RightTwo}>
            {items.map((item, index) => (
              <div className={styles.ProdOne} key={item.id || index}>
                <div className={styles.ProdImage}>
                  <Image
                    src={item.image || one}
                    alt={item.name}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.ProdNameAndweight}>
                  <h4>{item.name}</h4>
                </div>
                <div className={styles.ProdQnty}>
                  <p>x{item.quantity}</p>
                </div>
                <div className={styles.ProdPrice}>
                  <h4>AED {parseFloat(item.price).toFixed(2)}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.RightThree}>
            <div className={styles.Subtotal}>
              <p>Subtotal</p>
              <h5>AED {calcSubtotal}</h5>
            </div>
            <div className={styles.Shipping}>
              <p>Shipping</p>
              <h5>AED {totals.shipping.toFixed(2)}</h5>
            </div>

            {totals.discount > 0 && (
              <div className={styles.CuponDiscount}>
                <p>Coupon Discount</p>
                <h5>- AED {totals.discount.toFixed(2)}</h5>
              </div>
            )}

            <div className={styles.EstimatedTax}>
              <p>Estimated Taxes</p>
              <h5>AED {totals.tax.toFixed(2)}</h5>
            </div>
            <div className={styles.RightLine}></div>
            <div className={styles.Total}>
              <p>Total</p>
              <h5>AED {totals.total.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderCompletion() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
