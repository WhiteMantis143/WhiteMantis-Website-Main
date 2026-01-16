"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import one from "./1.png";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../_context/CartContext";

import { stripeElementStyle } from "./_components/stripeStyles.js";
import {
  Elements,
  ExpressCheckoutElement,
  useStripe,
  useElements,
  CardExpiryElement,
  CardCvcElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({
  session, status,
  delivery, setDelivery,
  savedAddresses,
  selectedAddressId, setSelectedAddressId,
  openMenuId, setOpenMenuId,
  showNewAddressForm, setShowNewAddressForm,
  useShippingAsBilling, setUseShippingAsBilling,
  product, cartTotals,
  shippingForm, setShippingForm,
  billingForm, setBillingForm,
  checkoutMode, subscriptionId, variationId
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { appliedCoupon, removeCoupon, openCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Set email from session when available
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session?.user?.email);
    }
  }, [session?.user?.email]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // 1. Get Card Element
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        toast.error("Invalid card details");
        setIsProcessing(false);
        openCart();
        router.push('/');
        return;
      }

      // Helper for Country Code
      const getCountryCode = (name) => {
        if (!name) return 'AE';
        const map = {
          'united arab emirates': 'AE',
          'uae': 'AE',
          'india': 'IN',
          'united states': 'US',
          'usa': 'US',
          'united kingdom': 'GB',
          'uk': 'GB',
          'saudi arabia': 'SA',
          'oman': 'OM',
          'bahrain': 'BH',
          'kuwait': 'KW',
          'qatar': 'QA'
        };
        return map[name.toLowerCase()] || (name.length === 2 ? name.toUpperCase() : 'AE');
      };

      // 2. Prepare Billing Details for Stripe
      let billingDetails = {
        email: email || session?.user?.email,
        name: "",
        phone: "",
        address: { country: 'AE' } // Default
      };

      if (useShippingAsBilling) {
        if (delivery === 'ship') {
          if (status === 'authenticated' && !showNewAddressForm && selectedAddressId) {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (addr) {
              billingDetails.name = addr.name;
              billingDetails.address = {
                line1: addr.original.address,
                line2: addr.original.apartment,
                city: addr.original.city,
                country: getCountryCode(addr.original.country),
              };
            }
          } else {
            billingDetails.name = `${shippingForm.firstName} ${shippingForm.lastName}`;
            billingDetails.phone = shippingForm.phone;
            billingDetails.address = {
              line1: shippingForm.address,
              line2: shippingForm.apartment,
              city: shippingForm.city,
              country: 'AE'
            }
          }
        }
      } else {
        billingDetails.name = `${billingForm.firstName} ${billingForm.lastName}`;
        billingDetails.phone = billingForm.phone;
        billingDetails.address = {
          line1: billingForm.address,
          line2: billingForm.apartment,
          city: billingForm.city,
          country: 'AE'
        }
      }

      // 3. Create Payment Method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (pmError) {
        toast.error(pmError.message);
        setIsProcessing(false);
        openCart();
        router.push('/');
        return;
      }

      // 4. Construct Backend Payload
      const formatAddr = (fName, lName, addr, apt, city, country, phone) => ({
        label: "Home Address",
        firstName: fName,
        lastName: lName,
        address: addr,
        apartment: apt,
        city: city,
        state: "",
        country: country || "",
        phone: phone,
        postalCode: ""
      });

      let shippingMeta = {};
      let billingMeta = {};

      // Resolve Shipping
      if (delivery === 'ship') {
        if (status === 'authenticated' && !showNewAddressForm && selectedAddressId) {
          const s = savedAddresses.find(a => a.id === selectedAddressId)?.original;
          if (s) shippingMeta = formatAddr(s.firstName, s.lastName, s.address, s.apartment, s.city, s.country, s.phone);
        } else {
          shippingMeta = formatAddr(shippingForm.firstName, shippingForm.lastName, shippingForm.address, shippingForm.apartment, shippingForm.city, "United Arab Emirates", shippingForm.phone);
        }
      } else {
        shippingMeta = formatAddr("", "", "Pickup", "", "", "United Arab Emirates", "");
      }

      // Resolve Billing
      const effectiveUseShippingAsBilling = useShippingAsBilling && delivery !== 'pickup';

      if (effectiveUseShippingAsBilling) {
        billingMeta = { ...shippingMeta };
      } else {
        billingMeta = formatAddr(billingForm.firstName, billingForm.lastName, billingForm.address, billingForm.apartment, billingForm.city, "United Arab Emirates", billingForm.phone);
      }

      const addressPayload = {
        billing: billingMeta,
        shipping: shippingMeta,
        addressId: selectedAddressId,
        shippingAsbillingAddress: useShippingAsBilling,
        saveAddress: shippingForm.saveAddress
      };

      const payload = {
        checkout: {
          type: checkoutMode,
          ...(checkoutMode === 'subscription' ? {
            subscriptionProductId: subscriptionId,
            subscriptionProductVariationId: variationId
          } : {})
        },
        deliveryOption: delivery,
        address: addressPayload,
        paymentMethodId: paymentMethod.id,
        email: email || session?.user?.email
      };

      // 5. Create Checkout Session
      const response = await fetch("/api/website/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Checkout failed");
      }

      // 6. Confirm Payment
      if (data.clientSecret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret);

        if (confirmError) {
          toast.error(confirmError.message);
          setIsProcessing(false);
          openCart();
          router.push('/');
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          toast.success("Payment successful!");

          // Clear the cart after successful payment
          try {
            await fetch("/api/website/cart/clear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
          } catch (clearError) {
            console.error("Failed to clear cart:", clearError);
          }

          // Build success URL with guest token if available
          let successUrl = `/checkout/success?type=order&id=${data.orderId}&order_id=${data.orderId}`;
          if (data.guestAccessToken) {
            successUrl += `&token=${encodeURIComponent(data.guestAccessToken)}`;
          }

          router.push(successUrl);
        }
      }

    } catch (e) {
      console.error(e);
      toast.error(e.message || "An error occurred");
      openCart();
      // router.push('/');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.Main} onClick={() => setOpenMenuId(null)}>
      <div className={styles.MainConatiner}>
        <div className={styles.Left}>
          <div className={styles.One}>
            <p>Express Checkout</p>
            <ExpressCheckoutElement />
          </div>

          <div className={styles.Two}>
            <div className={styles.TwoOne}>
              <h3>CONTACT</h3>
              {status !== "authenticated" && <p>Sign In</p>}
            </div>

            <div className={styles.TwoTwo}>
              <input
                className={styles.Input}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!session?.user?.email}
              />
              <label className={styles.CheckBox}>
                <input type="checkbox" />
                <p>Email me with news and offers.</p>
              </label>
            </div>
          </div>

          <div className={styles.Three}>
            <div className={styles.HeaderRow}>
              <h3>DELIVERY</h3>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 0L0 5L1.41 6.41L5 2.83L8.59 6.41L10 5L5 0Z" fill="#2F362A" transform="rotate(180 5 3)" />
              </svg>
            </div>

            <div className={styles.ThreeTwo}>
              <div
                className={`${styles.ThreeRow} ${delivery === "ship" ? styles.Active : ""
                  }`}
                onClick={() => setDelivery("ship")}
              >
                <div className={styles.RowLeft}>
                  <span className={styles.Radio}>
                    {delivery === "ship" && (
                      <span className={styles.RadioInner} />
                    )}
                  </span>
                  <p>Ship</p>
                </div>
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_3505_14846"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <rect width="24" height="24" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_3505_14846)">
                      <path
                        d="M7.24944 19.5C6.4866 19.5 5.8376 19.2323 5.30244 18.697C4.7671 18.1618 4.49944 17.5128 4.49944 16.75H2.13419L2.46869 15.25H5.01494C5.24694 14.8692 5.55944 14.5657 5.95244 14.3395C6.34527 14.1132 6.7776 14 7.24944 14C7.72127 14 8.15369 14.1132 8.54669 14.3395C8.93952 14.5657 9.25202 14.8692 9.48419 15.25H13.8802L16.0284 6H5.07844L5.13994 5.7385C5.21427 5.37433 5.3921 5.07692 5.67344 4.84625C5.95494 4.61542 6.28602 4.5 6.66669 4.5H17.9032L17.0359 8.25H19.5379L22.3937 12.0578L21.4609 16.75H19.8839C19.8839 17.5128 19.6164 18.1618 19.0812 18.697C18.5459 19.2323 17.8969 19.5 17.1342 19.5C16.3714 19.5 15.7223 19.2323 15.1869 18.697C14.6518 18.1618 14.3842 17.5128 14.3842 16.75H9.99944C9.99944 17.5128 9.73177 18.1618 9.19644 18.697C8.66127 19.2323 8.01227 19.5 7.24944 19.5ZM15.9052 13.125H20.6437L20.7822 12.4173L18.7879 9.75H16.6917L15.9052 13.125ZM15.8822 6.5885L16.0284 6L13.8802 15.25L14.0264 14.6615L15.8822 6.5885ZM1.08594 13.1615L1.46094 11.6615H6.45144L6.07644 13.1615H1.08594ZM3.08594 9.5885L3.46094 8.0885H9.45144L9.07644 9.5885H3.08594ZM7.24944 18C7.59694 18 7.89211 17.8785 8.13494 17.6355C8.37794 17.3927 8.49944 17.0975 8.49944 16.75C8.49944 16.4025 8.37794 16.1073 8.13494 15.8645C7.89211 15.6215 7.59694 15.5 7.24944 15.5C6.90194 15.5 6.60677 15.6215 6.36394 15.8645C6.12094 16.1073 5.99944 16.4025 5.99944 16.75C5.99944 17.0975 6.12094 17.3927 6.36394 17.6355C6.60677 17.8785 6.90194 18 7.24944 18ZM17.1342 18C17.4815 18 17.7767 17.8785 18.0197 17.6355C18.2627 17.3927 18.3842 17.0975 18.3842 16.75C18.3842 16.4025 18.2627 16.1073 18.0197 15.8645C17.7767 15.6215 17.4815 15.5 17.1342 15.5C16.7867 15.5 16.4914 15.6215 16.2484 15.8645C16.0054 16.1073 15.8839 16.4025 15.8839 16.75C15.8839 17.0975 16.0054 17.3927 16.2484 17.6355C16.4914 17.8785 16.7867 18 17.1342 18Z"
                        fill="#6E736A"
                      />
                    </g>
                  </svg>
                </span>
              </div>

              <div
                className={`${styles.ThreeRow} ${delivery === "pickup" ? styles.Active : ""
                  }`}
                onClick={() => setDelivery("pickup")}
              >
                <div className={styles.RowLeft}>
                  <span className={styles.Radio}>
                    {delivery === "pickup" && (
                      <span className={styles.RadioInner} />
                    )}
                  </span>
                  <p>Pick up</p>
                </div>
                <span>
                  <svg
                    width="20"
                    height="18"
                    viewBox="0 0 20 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.5612 7.723V15.6923C18.5612 16.1974 18.3862 16.625 18.0362 16.975C17.6862 17.325 17.2587 17.5 16.7537 17.5H2.86894C2.36394 17.5 1.93644 17.325 1.58644 16.975C1.23644 16.625 1.06144 16.1974 1.06144 15.6923V7.70375C0.658774 7.37308 0.356524 6.94392 0.154691 6.41625C-0.0473092 5.88875 -0.0514759 5.31925 0.142191 4.70775L1.15369 1.40375C1.28702 0.983251 1.51327 0.644167 1.83244 0.386501C2.15177 0.128834 2.53319 0 2.97669 0H16.6267C17.0704 0 17.4492 0.123084 17.7632 0.369251C18.0774 0.615417 18.3062 0.953917 18.4497 1.38475L19.4804 4.70775C19.6741 5.31925 19.6699 5.88683 19.4679 6.4105C19.2661 6.93433 18.9639 7.37183 18.5612 7.723ZM12.0114 7C12.5576 7 12.9682 6.833 13.2432 6.499C13.5182 6.165 13.6307 5.80633 13.5807 5.423L12.9729 1.5H10.5612V5.45C10.5612 5.8705 10.7035 6.234 10.9882 6.5405C11.2729 6.84683 11.6139 7 12.0114 7ZM7.51144 7C7.97161 7 8.34494 6.84683 8.63144 6.5405C8.91811 6.234 9.06144 5.8705 9.06144 5.45V1.5H6.64969L6.04219 5.4615C5.98819 5.81667 6.09969 6.16192 6.37669 6.49725C6.65369 6.83242 7.03194 7 7.51144 7ZM3.06144 7C3.43194 7 3.75052 6.87083 4.01719 6.6125C4.28386 6.35417 4.44861 6.0295 4.51144 5.6385L5.09969 1.5H2.97669C2.86769 1.5 2.78119 1.524 2.71719 1.572C2.65302 1.62017 2.60494 1.69233 2.57294 1.7885L1.61119 5.04225C1.47919 5.47175 1.54144 5.90542 1.79794 6.34325C2.05427 6.78108 2.47544 7 3.06144 7ZM16.5614 7C17.1024 7 17.5165 6.7875 17.8037 6.3625C18.0909 5.9375 18.1601 5.49742 18.0114 5.04225L16.9997 1.76925C16.9677 1.67308 16.9197 1.60417 16.8557 1.5625C16.7915 1.52083 16.7049 1.5 16.5959 1.5H14.5229L15.1112 5.6385C15.174 6.0295 15.3388 6.35417 15.6054 6.6125C15.8721 6.87083 16.1908 7 16.5614 7ZM2.86894 16H16.7537C16.8434 16 16.917 15.9712 16.9747 15.9135C17.0325 15.8558 17.0614 15.7821 17.0614 15.6923V8.4115C16.9524 8.45133 16.8614 8.476 16.7882 8.4855C16.7152 8.49517 16.6396 8.5 16.5614 8.5C16.1114 8.5 15.7156 8.41858 15.3739 8.25575C15.0323 8.09292 14.7011 7.832 14.3804 7.473C14.0998 7.78583 13.7678 8.03525 13.3844 8.22125C13.0011 8.40708 12.5639 8.5 12.0729 8.5C11.6486 8.5 11.2486 8.41183 10.8729 8.2355C10.4973 8.05933 10.1434 7.80517 9.81144 7.473C9.50244 7.80517 9.15244 8.05933 8.76144 8.2355C8.37028 8.41183 7.97411 8.5 7.57294 8.5C7.12161 8.5 6.69852 8.41825 6.30369 8.25475C5.90886 8.09125 5.56144 7.83067 5.26144 7.473C4.84077 7.8935 4.45319 8.16983 4.09869 8.302C3.74436 8.434 3.39861 8.5 3.06144 8.5C2.98311 8.5 2.90227 8.49517 2.81894 8.4855C2.73561 8.476 2.64969 8.45133 2.56119 8.4115V15.6923C2.56119 15.7821 2.59011 15.8558 2.64794 15.9135C2.70561 15.9712 2.77927 16 2.86894 16Z"
                      fill="#6E736A"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.Four}>
            {delivery === "ship" && (
              <>
                <div className={styles.Three}>
                  <h3>SHIP TO</h3>
                </div>
                <div className={styles.HeaderRow}>
                  <input
                    className={styles.Input}
                    value="United Arab Emirates"
                    readOnly
                    style={{ display: 'none' }}
                  />
                </div>

                {status === "authenticated" && (
                  <>
                    <div className={styles.AddressList}>
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`${styles.AddressCard} ${selectedAddressId === addr.id ? styles.Selected : ""
                            }`}
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <span className={styles.Radio}>
                            {selectedAddressId === addr.id && (
                              <span className={styles.RadioInner} />
                            )}
                          </span>
                          <div className={styles.AddressContent}>
                            <p className={styles.AddressName}>
                              {addr.name}, {addr.address}
                            </p>
                            <p className={styles.AddressText}>{addr.city}</p>
                          </div>
                          {selectedAddressId === addr.id && (
                            <div className={styles.MenuContainer}>
                              <div
                                className={styles.MenuIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === addr.id ? null : addr.id);
                                }}
                              >
                                <svg width="3" height="15" viewBox="0 0 3 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="1.5" cy="1.5" r="1.5" fill="#6E736A" />
                                  <circle cx="1.5" cy="7.5" r="1.5" fill="#6E736A" />
                                  <circle cx="1.5" cy="13.5" r="1.5" fill="#6E736A" />
                                </svg>
                              </div>
                              {openMenuId === addr.id && (
                                <div className={styles.MenuDropdown} onClick={(e) => e.stopPropagation()}>
                                  <button className={styles.MenuItem}>Edit</button>
                                  <button className={styles.MenuItem}>Delete</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!showNewAddressForm ? (
                      <button
                        className={styles.AddNewAddress}
                        onClick={() => {
                          if (savedAddresses.length >= 5) {
                            toast.error("Remove one address first as 5 address is the limit");
                            return;
                          }
                          setShowNewAddressForm(true);
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 0V12M0 6H12"
                            stroke="#6E736A"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <p>Use a different address</p>
                      </button>
                    ) : (
                      <button
                        className={styles.AddNewAddress}
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L11 11M1 11L11 1" stroke="#6E736A" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p>Discard</p>
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {(showNewAddressForm || status !== "authenticated") && delivery === "ship" && (
              <>
                <input
                  className={styles.Input}
                  value="United Arab Emirates"
                  readOnly
                />
                <div className={styles.Row}>
                  <input
                    className={styles.Input}
                    placeholder="First Name"
                    value={shippingForm.firstName}
                    onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                  />
                  <input
                    className={styles.Input}
                    placeholder="Last Name"
                    value={shippingForm.lastName}
                    onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                  />
                </div>
                <input
                  className={styles.Input}
                  placeholder="House number, Street name"
                  value={shippingForm.address}
                  onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                />
                <input
                  className={styles.Input}
                  placeholder="Apartment, suite, etc. (optional)"
                  value={shippingForm.apartment}
                  onChange={(e) => setShippingForm({ ...shippingForm, apartment: e.target.value })}
                />
                <div className={styles.Row}>
                  <input
                    className={styles.Input}
                    placeholder="City"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                  />
                  <select className={styles.Select}>
                    <option>Dubai</option>
                    <option>Abu Dhabi</option>
                    <option>Sharjah</option>
                    <option>Ajman</option>
                    <option>Umm Al Quwain</option>
                    <option>Ras Al Khaimah</option>
                    <option>Fujairah</option>
                  </select>
                </div>
                <input
                  className={styles.Input}
                  placeholder="Phone"
                  value={shippingForm.phone}
                  onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                />
                {status === "authenticated" && (
                  <label className={styles.CheckBox}>
                    <input
                      type="checkbox"
                      checked={shippingForm.saveAddress}
                      onChange={(e) => setShippingForm({ ...shippingForm, saveAddress: e.target.checked })}
                    />
                    <p>Save this for next time.</p>
                  </label>
                )}
              </>
            )}

            {delivery === "pickup" && (
              <div className={styles.PickupList}>
                <p>Pickup Locations Near You</p>

                <div className={styles.PickupCard}>
                  <input type="radio" style={{ accentColor: "#2F362A" }} checked readOnly />
                  <div>
                    <h5>White Mantis Roastery - Al Quoz</h5>
                    <p>Warehouse #2 – Al Quoz Industrial Area 4, Dubai</p>
                    <span>10:00 AM – 7:00 PM</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.Five}>
            <h3>PAYMENT</h3>
            <p>All transactions are secure and encrypted.</p>

            <div className={styles.PaymentContainer}>
              <div className={styles.PaymentHeader}>
                <p>Credit Card</p>
              </div>
              <div className={styles.PaymentBody}>
                <div className={styles.StripeInput}>
                  <CardNumberElement options={{ ...stripeElementStyle, disableLink: true }} />
                </div>

                <div className={styles.Row}>
                  <div className={styles.StripeInput}>
                    <CardExpiryElement options={stripeElementStyle} />
                  </div>

                  <div className={styles.StripeInput}>
                    <CardCvcElement options={stripeElementStyle} />
                  </div>
                </div>
              </div>
            </div>

            {delivery !== "pickup" && (
              <label className={styles.BillingToggle}>
                <input
                  type="checkbox"
                  checked={useShippingAsBilling}
                  onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                />
                <p>Use shipping address as billing address</p>
              </label>
            )}

            {(!useShippingAsBilling || delivery === "pickup") && (
              <>
                <h3>BILLING ADDRESS</h3>
                <input
                  className={styles.Input}
                  value="United Arab Emirates"
                  readOnly
                />
                <div className={styles.Row}>
                  <input
                    className={styles.Input}
                    placeholder="First Name"
                    value={billingForm.firstName}
                    onChange={(e) => setBillingForm({ ...billingForm, firstName: e.target.value })}
                  />
                  <input
                    className={styles.Input}
                    placeholder="Last Name"
                    value={billingForm.lastName}
                    onChange={(e) => setBillingForm({ ...billingForm, lastName: e.target.value })}
                  />
                </div>
                <input
                  className={styles.Input}
                  placeholder="House number, Street name"
                  value={billingForm.address}
                  onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                />
                <input
                  className={styles.Input}
                  placeholder="Apartment, suite, etc. (optional)"
                  value={billingForm.apartment}
                  onChange={(e) => setBillingForm({ ...billingForm, apartment: e.target.value })}
                />
                <div className={styles.Row}>
                  <input
                    className={styles.Input}
                    placeholder="City"
                    value={billingForm.city}
                    onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                  />
                  <select className={styles.Select}>
                    <option>Dubai</option>
                    <option>Abu Dhabi</option>
                    <option>Sharjah</option>
                    <option>Ajman</option>
                    <option>Umm Al Quwain</option>
                    <option>Ras Al Khaimah</option>
                    <option>Fujairah</option>
                  </select>
                </div>
                <input
                  className={styles.Input}
                  placeholder="Phone"
                  value={billingForm.phone}
                  onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                />
              </>
            )}
          </div>

          <div className={styles.Six}>
            <button
              className={styles.Pay}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
            <div className={styles.PageLinks}>
              <p>Refund policy</p>
              <p>Shipping</p>
              <p>Privacy policy</p>
              <p>Terms of service</p>
              <p>Cancellations</p>
              <p>Contact</p>
            </div>
          </div>
        </div>

        <div className={styles.Line}></div>

        <div className={styles.Right}>
          <div className={styles.RightOne}>
            <h3>Order Summary</h3>
            <p>({product.length} items)</p>
          </div>

          <div className={styles.RightTwo}>
            {product.map((item, idx) => (
              <div className={styles.ProdOne} key={item.id || idx}>
                <div className={styles.ProdImage}>
                  <Image
                    src={item.image || one}
                    alt="product image"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className={styles.ProdDetails}>
                  <h4>{item.title || item.name}</h4>
                  <p>
                    {item.attributes?.attribute_pa_weight || item.weight} | {item.quantity}x
                  </p>
                  {item.frequency && <span>{item.frequency}</span>}
                </div>

                <div className={styles.ProdPrice}>
                  <h4>AED {parseFloat(item.price?.final_price || item.price).toFixed(2)}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.RightThree}>
            <div className={styles.Subtotal}>
              <p>Subtotal</p>
              <h5>AED {cartTotals.subtotal.toFixed(2)}</h5>
            </div>

            {cartTotals.discount > 0 && (
              <div className={styles.Subtotal}>
                <p>Discount</p>
                <h5 style={{ color: 'green' }}>- AED {cartTotals.discount.toFixed(2)}</h5>
              </div>
            )}

            <div className={styles.Shipping}>
              <p>Shipping</p>
              <h5>{cartTotals.shipping === 0 ? (delivery === 'pickup' ? 'Free (Pickup)' : 'Calculated at next step') : `AED ${cartTotals.shipping.toFixed(2)}`}</h5>
            </div>

            <div className={styles.EstimatedTax}>
              <p>Estimated Taxes</p>
              <h5>AED {cartTotals.tax.toFixed(2)}</h5>
            </div>
            <div className={styles.RightLine}></div>
            <div className={styles.Total}>
              <p>Total</p>
              <h5>AED {cartTotals.total.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get mode and IDs from URL parameters
  const mode = searchParams.get('mode');
  const subscriptionId = searchParams.get('subscriptionId');
  const variationId = searchParams.get('variationId');

  const [delivery, setDelivery] = useState("ship");
  const [checkoutMode, setCheckoutMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProducts] = useState([]);
  const [savedAddresses, setsavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(false);
  const { data: session, status } = useSession();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const { cartTotals: contextCartTotals } = useCart();

  const [shippingTax, setShippingTax] = useState({ shipping: 0, tax: 0, taxPercent: 0 });

  // Form States
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    saveAddress: false
  });

  const [billingForm, setBillingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    phone: ""
  });

  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  });

  useEffect(() => {
    const validateAndFetchData = async () => {
      if (mode === 'subscription') {
        if (!subscriptionId || !variationId) {
          toast.error('Invalid subscription checkout.')
          router.push('/');
          return;
        }
        setCheckoutMode('subscription');

        try {
          const response = await fetch(`/api/website/products/${subscriptionId}`);
          const data = await response.json();

          if (response.ok) {

            if (data.product?.type !== "variable-subscription") {
              toast.error('Invalid subscription checkout.')
              router.push('/')
              return
            }

            // Standardize subscription product structure to match cart
            setProducts([{
              id: data.product.id,
              image: data.product.images[0]?.src || one, // Fallback image
              title: data.product.name,
              weight: data.product.attributes.find(a => a.name === 'Weight')?.option || '',
              quantityText: "1x", // basic assumption for sub
              frequency: data.product.meta_data.find(m => m.key === '_subscription_period')?.value || 'Monthly',
              price: data.variation?.price || data.product.price,
              quantity: 1
            }])
            // Calculate totals for subscription (simplified)
            const price = parseFloat(data.variation?.price || data.product.price || 0);
            setCartTotals({
              subtotal: price,
              shipping: 0, // Placeholder
              tax: 0, // Placeholder
              total: price
            });

          } else {
            toast.error('Failed to load subscription details');
            return
          }
        } catch (error) {
          toast.error('Failed to load subscription details');
          return
        }
      } else if (mode === 'cart') {
        setCheckoutMode('cart');

        try {
          const response = await fetch(`/api/website/cart/get`);
          const data = await response.json();

          if (response.ok && data.cart && data.cart.products) {
            setProducts(data.cart.products);
            // Calculate totals
            const sub = data.cart.products.reduce((acc, item) => acc + (parseFloat(item.price.final_price || item.price) * item.quantity), 0);
            const ship = 0; // You might need another fetching logic for real shipping costs
            const tax = 0; // Placeholder
            setCartTotals({
              subtotal: sub,
              shipping: ship,
              tax: tax,
              total: sub + ship + tax
            });

          } else {
            console.error("Cart data malformed", data);
            toast.error('Failed to load cart details');
            return
          }
        } catch (error) {
          console.error("Cart fetch error", error);
          toast.error('Failed to load cart details');
          return
        }
      } else {
        toast.error('Invalid checkout mode. Redirecting to home.');
        router.push('/');
        return;
      }

      // Fetch addresses if authenticated
      if (status === "authenticated") {
        try {
          const addrResponse = await fetch('/api/website/profile/address/get');
          const addrData = await addrResponse.json();
          if (addrData.success && addrData.addresses) {
            const mappedAddresses = addrData.addresses.map((addr) => ({
              id: addr.id,
              name: `${addr.firstName} ${addr.lastName}`,
              address: `${addr.address}${addr.apartment ? ', ' + addr.apartment : ''}`,
              city: `${addr.city}, ${addr.country}`,
              original: addr
            }));
            setsavedAddresses(mappedAddresses);
            // Select default address if available, otherwise first
            const defaultAddr = mappedAddresses.find(a => a.original.setAsDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            } else if (mappedAddresses.length > 0) {
              setSelectedAddressId(mappedAddresses[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to fetch addresses", error);
        }
      }

      // Fetch Shipping and Tax
      try {
        const taxRes = await fetch('/api/website/get-shipping-tax');
        const taxData = await taxRes.json();
        if (taxData.success && taxData.data) {
          setShippingTax({
            shipping: parseFloat(taxData.data.shipping?.cost || 0),
            tax: 0,
            taxPercent: parseFloat(taxData.data.tax?.percent || 0),
          });
        }
      } catch (e) {
        console.error("Failed to fetch shipping/tax", e);
      }

      setIsLoading(false);
    };

    validateAndFetchData();
  }, [mode, subscriptionId, variationId, router, status]);

  // Recalculate totals
  useEffect(() => {
    let sub = 0;
    let disc = 0;

    if (checkoutMode === 'cart') {
      sub = product.reduce((acc, item) => {
        const price = parseFloat(item.price?.final_price || item.price || 0);
        return acc + (price * (item.quantity || 1));
      }, 0);

      // If coupon applied in context
      if (contextCartTotals?.discount) {
        disc = contextCartTotals.discount;
      }
    } else if (checkoutMode === 'subscription') {
      sub = product.reduce((acc, item) => acc + (parseFloat(item.price?.final_price || item.price || 0) * (item.quantity || 1)), 0);
    }

    const shipping = delivery === 'ship' ? shippingTax.shipping : 0;

    // Tax Calculation: (Subtotal - Discount + Shipping) * Percent
    const taxableAmount = Math.max(0, sub - disc + shipping);
    const tax = taxableAmount * (shippingTax.taxPercent / 100);

    const total = Math.max(0, sub - disc + shipping + tax);

    setCartTotals({
      subtotal: sub,
      discount: disc,
      shipping: shipping,
      tax: tax,
      total: total
    });

  }, [product, checkoutMode, contextCartTotals, shippingTax, delivery]);

  if (isLoading) {
    return (
      <div className={styles.Main}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Don't render if mode validation failed
  if (!checkoutMode) {
    return null; // Redirecting...
  }

  const options = {
    appearance: { theme: "stripe" },
    paymentMethodCreation: "manual",
    mode: "payment",
    amount: Math.round(cartTotals.total * 100) || 100, // Pass in fils
    currency: "aed",
  };

  return (
    <Elements stripe={stripePromise} options={options} key={session?.user?.email || "no-email"}>
      <CheckoutForm
        session={session}
        status={status}
        delivery={delivery}
        setDelivery={setDelivery}
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        showNewAddressForm={showNewAddressForm}
        setShowNewAddressForm={setShowNewAddressForm}
        useShippingAsBilling={useShippingAsBilling}
        setUseShippingAsBilling={setUseShippingAsBilling}
        product={product}
        cartTotals={cartTotals}
        shippingForm={shippingForm}
        setShippingForm={setShippingForm}
        billingForm={billingForm}
        setBillingForm={setBillingForm}
        checkoutMode={checkoutMode}
        subscriptionId={subscriptionId}
        variationId={variationId}
      />
    </Elements>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
