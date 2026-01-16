"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { COUNTRIES, STATES as COUNTRY_STATES } from "../../lib/countries";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function StripePaymentForm({
  billing,
  user,
  appliedCoupon,
  clearCart,
  setResult,
  displayTotal
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setResult({ ok: false, error: "Stripe has not loaded yet. Please wait." });
      return;
    }

    // Validate billing info
    if (!user) {
      if (
        !billing.email ||
        !billing.phone ||
        !billing.address_1 ||
        !billing.city
      ) {
        setResult({ ok: false, error: "Please fill email, phone and address" });
        return;
      }
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Step 1: Submit the Elements form (required by Stripe)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Error submitting form:", submitError);
        setResult({ ok: false, error: submitError.message || "Failed to submit form" });
        setIsProcessing(false);
        return;
      }

      // Step 2: Create PaymentMethod from Stripe Elements
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            email: billing.email || user?.email,
            name: `${billing.first_name} ${billing.last_name}`,
            phone: billing.phone,
            address: {
              line1: billing.address_1,
              line2: billing.address_2,
              city: billing.city,
              postal_code: billing.postcode,
              country: billing.country,
              state: billing.state,
            },
          },
        },
      });

      if (pmError) {
        console.error("Error creating payment method:", pmError);
        setResult({ ok: false, error: pmError.message || "Failed to create payment method" });
        setIsProcessing(false);
        return;
      }

      console.log("✅ PaymentMethod created:", paymentMethod.id);

      // Step 3: Prepare address payload
      const addressPayload = {
        billing: {
          firstName: billing.first_name || "",
          lastName: billing.last_name || "",
          address: billing.address_1 || "",
          apartment: billing.address_2 || "",
          city: billing.city || "",
          postalCode: billing.postcode || "",
          country: billing.country || "",
          state: billing.state || "",
          phone: billing.phone || "",
        },
        shipping: {
          firstName: billing.first_name || "",
          lastName: billing.last_name || "",
          address: billing.address_1 || "",
          apartment: billing.address_2 || "",
          city: billing.city || "",
          postalCode: billing.postcode || "",
          country: billing.country || "",
          state: billing.state || "",
          phone: billing.phone || "",
        },
        shippingAsbillingAddress: true,
        saveAddress: !!user,
      };

      // Step 4: Create checkout session with cart type
      // Extract coupon code properly - ensure it's a string, not an object
      let couponCodeToSend = null;
      if (appliedCoupon) {
        if (typeof appliedCoupon === 'string' && appliedCoupon !== '[object Object]') {
          couponCodeToSend = appliedCoupon;
        } else if (appliedCoupon.code && typeof appliedCoupon.code === 'string' && appliedCoupon.code !== '[object Object]') {
          couponCodeToSend = appliedCoupon.code;
        }
      }

      const response = await fetch("/api/website/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout: {
            type: "cart",
            couponCode: couponCodeToSend
          },
          deliveryOption: "ship",
          address: addressPayload,
          email: billing.email || user?.email || "",
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();
      console.log("📥 API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create checkout session");
      }

      // Step 5: Confirm payment if clientSecret is returned
      if (data.success && data.clientSecret) {
        console.log("💳 Confirming payment on frontend...");

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: window.location.origin + "/checkout/success",
          },
          redirect: "if_required",
        });

        if (confirmError) {
          setResult({ ok: false, error: confirmError.message });
          setIsProcessing(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          console.log("✅ Payment succeeded!");
          await clearCart();

          // Redirect to success page with order ID and type
          window.location.href = `/checkout/success?type=order&id=${data.orderId}&order_id=${data.orderId}`;
        } else {
          console.log("⚠️ Payment status:", paymentIntent?.status);
          setResult({ ok: false, error: "Payment was not successful. Please try again." });
        }
      } else {
        throw new Error("No client secret returned from server");
      }
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      setResult({ ok: false, error: error.message || "Failed to process payment. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Payment Details</h3>
      <div style={{ marginBottom: 20 }}>
        <PaymentElement />
      </div>
      <button
        onClick={handlePayment}
        disabled={isProcessing || !stripe || !elements}
        style={{
          backgroundColor: '#635BFF',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 600,
          cursor: isProcessing || !stripe || !elements ? 'not-allowed' : 'pointer',
          opacity: isProcessing || !stripe || !elements ? 0.6 : 1,
          width: '100%',
        }}
      >
        {isProcessing ? "Processing..." : `Pay AED ${(displayTotal / 100).toFixed(2)} with Stripe`}
      </button>
    </div>
  );
}


export default function CheckoutPage() {
  const { clearCart, loading: cartContextLoading, appliedCoupon, cartTotals } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    postcode: "",
    country: "",
    state: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // New state for cart data from API
  const [cartData, setCartData] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    (async () => {
      if (user) {
        try {
          const r = await fetch("/api/website/profile/get");
          if (r.ok) {
            const d = await r.json();

            // Check for saved addresses in metadata
            const savedAddressesMeta = d.metaData?.find(
              (meta) => meta.key === "saved_addresses"
            );

            const savedAddresses = savedAddressesMeta?.value || [];

            // If user has saved addresses, use the first one
            if (savedAddresses.length > 0) {
              const firstAddress = savedAddresses[0];
              setBilling({
                first_name: firstAddress.firstName || "",
                last_name: firstAddress.lastName || "",
                email: user.email || "",
                phone: firstAddress.phone || "",
                address_1: firstAddress.address || "",
                address_2: firstAddress.apartment || "",
                city: firstAddress.city || "",
                postcode: firstAddress.postalCode || "",
                country: firstAddress.country || "",
                state: firstAddress.state || "",
              });
              setEditMode(false); // Show read-only view
            } else {
              // No saved addresses, show form
              setBilling((prev) => ({
                ...prev,
                email: user.email || prev.email,
              }));
              setEditMode(true);
            }
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
        }
      } else {
        setBilling((prev) => ({ ...prev, email: "" }));
        setEditMode(true);
      }
    })();
    // Check for buyNow payload in localStorage (one-time quick checkout)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("buyNow")) {
        const raw = localStorage.getItem("buyNow");
        if (raw) {
          const parsed = JSON.parse(raw);
          setBuyNowItem(parsed);
          // do not remove yet; remove after successful checkout
        }
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  // Fetch cart data from API
  useEffect(() => {
    async function fetchCart() {
      try {
        setLoadingCart(true);
        const response = await fetch("/api/website/cart/get");
        const data = await response.json();

        if (data.ok && data.cart) {
          setCartData(data.cart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoadingCart(false);
      }
    }

    // Only fetch cart if not in buyNow mode
    if (!buyNowItem) {
      fetchCart();
    } else {
      setLoadingCart(false);
    }
  }, [buyNowItem]);

  if (loadingCart || authLoading || cartContextLoading)
    return <div style={{ padding: 20 }}>Loading cart…</div>;

  function onChange(e) {
    const { name, value } = e.target;

    if (name === "country") {
      setBilling((prev) => ({ ...prev, country: value, state: "" }));
      return;
    }
    setBilling((prev) => ({ ...prev, [name]: value }));
  }

  async function saveToProfile() {
    setSavingProfile(true);
    setMessage(null);
    try {
      // Convert billing format to saved_addresses format
      const formattedAddress = {
        label: "Home Address",
        firstName: billing.first_name || "",
        lastName: billing.last_name || "",
        address: billing.address_1 || "",
        apartment: billing.address_2 || "",
        city: billing.city || "",
        state: billing.state || "",
        country: billing.country || "",
        phone: billing.phone || "",
        postalCode: billing.postcode || "",
        setAsDefault: true
      };

      const res = await fetch("/api/website/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saved_addresses: [formattedAddress]
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Save failed");
      setMessage("Saved to profile");
      setEditMode(false); // Switch to read-only view after saving
    } catch (e) {
      setMessage(String(e?.message || e));
    } finally {
      setSavingProfile(false);
    }
  }

  async function placeOrder() {
    // For guests, require email/phone/address_1/city/postcode at minimum
    if (!user) {
      if (
        !billing.email ||
        !billing.phone ||
        !billing.address_1 ||
        !billing.city
      ) {
        setResult({ ok: false, error: "Please fill email, phone and address" });
        return;
      }
    }

    setPlacing(true);
    try {
      const bodyPayload = { billing };

      // Handle buyNow mode
      if (buyNowItem) {
        bodyPayload.items = [
          {
            product_id: Number(buyNowItem.product_id),
            quantity: Number(buyNowItem.quantity || 1),
          },
        ];
        bodyPayload.buyNow = true;

        // Use regular order endpoint for buyNow
        const res = await fetch("/api/website/order/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        console.log(data)
        setResult(data);
        if (data && data.ok) {
          try {
            localStorage.removeItem("buyNow");
          } catch (e) { }
        }
        return;
      }

      // Check cart type for regular checkout
      const hasProducts = cartData?.products && cartData.products.length > 0;
      const hasSubscriptions = cartData?.subscription_products && cartData.subscription_products.length > 0;

      if (!hasProducts && !hasSubscriptions) {
        setResult({ ok: false, error: "Cart is empty" });
        return;
      }

      // Determine which endpoint to use
      // Unified endpoint now handles mixed orders (regular + subscription)
      const endpoint = "/api/website/order/create";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bodyPayload,
          manual_subtotal: cartTotals.subtotal.toFixed(2),
          manual_total: cartTotals.total.toFixed(2),
          manual_coupon_code: (appliedCoupon?.code && appliedCoupon.code !== '[object Object]') ? appliedCoupon.code : null,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data && data.ok) {
        await clearCart();
      }
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setPlacing(false);
    }
  }

  // Calculate display items and total from cart API data
  const displayItems = buyNowItem
    ? [
      {
        product_id: buyNowItem.product_id,
        name: buyNowItem.name,
        quantity: buyNowItem.quantity || 1,
        price: buyNowItem.price,
      },
    ]
    : [
      ...(cartData?.products || []),
      ...(cartData?.subscription_products || [])
    ].map(item => {
      // For subscriptions, use signup_fee as the price; for regular products, use price
      const itemPrice = item.subscription
        ? Number(item.subscription.signup_fee || 0)
        : Number(item.price || 0);

      return {
        product_id: item.product_id,
        variation_id: item.variation_id,
        name: item.name,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: (item.price && item.price.product_subtotal)
          ? item.price.product_subtotal
          : itemPrice * item.quantity,
        price_type: item.price_type,
        discount_amount: item.discount_amount,
        discount_percent: item.discount_percent,
        subscription: item.subscription, // Keep legacy subscription data if present
        subscription_details: item.subscription_details, // New detailed subscription structure
        attributes: item.attributes || [],
      };
    });

  const displayTotal = buyNowItem
    ? Number((buyNowItem.price || 0) * (buyNowItem.quantity || 1))
    : cartTotals.total;

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      {displayItems && displayItems.length > 0 ? (
        <div>
          <h3>Order Summary</h3>
          <div style={{ marginBottom: 20 }}>
            {displayItems.map((it, i) => (
              <div
                key={it.product_id || i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  borderBottom: '1px solid #eee',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{it.name}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    Quantity: {it.quantity}
                  </div>
                  {/* Show subscription details if available */}
                  {/* Attributes */}
                  {it.attributes && Object.keys(it.attributes).length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      {Object.entries(it.attributes).map(([key, value]) => (
                        <div key={key} style={{ fontSize: 13, color: "#555" }}>
                          {key.replace('attribute_', '').replace('pa_', '').replace(/_/g, ' ')}: {String(value)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show subscription details if available */}
                  {(it.subscription_details || it.subscription) && (
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4, background: '#f9f9f9', padding: 6, borderRadius: 4 }}>
                      {it.subscription_details ? (
                        <>
                          <div style={{ fontWeight: 600 }}>Subscription Plan:</div>
                          <div>Period: {it.subscription_details.length} {it.subscription_details.period}</div>
                          <div>Signup Fee: ₹{Number(it.subscription_details.sign_up_fee || 0).toFixed(2)}</div>
                        </>
                      ) : (
                        <>
                          {/* Fallback for legacy subscription object */}
                          <div>Signup Fee: ₹{Number(it.subscription.signup_fee || 0).toFixed(2)}</div>
                          <div>
                            Recurring: ₹{Number(it.subscription.recurring_price || 0).toFixed(2)} /
                            {it.subscription.period_interval > 1 ? ` ${it.subscription.period_interval}` : ''} {it.subscription.period}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {it.price_type === 'member_price' && it.discount_percent && (
                    <div style={{ color: '#28a745', fontSize: 12, marginTop: 4 }}>
                      💎 Member discount: {it.discount_percent}% off
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600 }}>
                  ₹{Number(it.subtotal || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
            Total: ₹ {Number(displayTotal).toFixed(2)}
          </div>

          <div style={{ marginTop: 16, maxWidth: 720 }}>
            <h3>Contact & address</h3>

            {/* If logged-in user has saved address and we're not in edit mode, show read-only address with Edit option */}
            {user && !editMode && billing.address_1 ? (
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <div>
                  <strong>Address:</strong>
                </div>
                <div>
                  {billing.address_1}
                  {billing.address_2 ? `, ${billing.address_2}` : ""}
                </div>
                <div>
                  {billing.city || ""}
                  {billing.postcode ? `, ${billing.postcode}` : ""}
                </div>
                <div>
                  {billing.state || ""} {billing.country || ""}
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Phone:</strong> {billing.phone || <em>not set</em>}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setEditMode(true)}>
                    Edit address
                  </button>
                </div>

                {/* If phone missing, prompt inline to add phone */}
                {!billing.phone ? (
                  <div style={{ marginTop: 12 }}>
                    <div>
                      Please add a phone number for faster support and shipping
                      updates.
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        name="phone"
                        placeholder="Phone"
                        value={billing.phone}
                        onChange={onChange}
                      />
                      <button onClick={saveToProfile} disabled={savingProfile}>
                        {savingProfile ? "Saving…" : "Save phone to profile"}
                      </button>
                    </div>
                    {message ? (
                      <div style={{ marginTop: 8 }}>{message}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              // Edit form (either guest, or user editing / no saved address)
              <div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      name="first_name"
                      placeholder="First Name"
                      value={billing.first_name}
                      onChange={onChange}
                    />
                    <input
                      name="last_name"
                      placeholder="Last Name"
                      value={billing.last_name}
                      onChange={onChange}
                    />
                  </div>
                  <input
                    name="email"
                    placeholder="Email"
                    value={billing.email}
                    onChange={onChange}
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={billing.phone}
                    onChange={onChange}
                  />
                  <input
                    name="address_1"
                    placeholder="Address"
                    value={billing.address_1}
                    onChange={onChange}
                  />
                  <input
                    name="address_2"
                    placeholder="Address 2"
                    value={billing.address_2}
                    onChange={onChange}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      name="city"
                      placeholder="City"
                      value={billing.city}
                      onChange={onChange}
                    />
                    <input
                      name="postcode"
                      placeholder="Postal code"
                      value={billing.postcode}
                      onChange={onChange}
                    />
                    {/* Show state select if known list exists for country, otherwise free input */}
                    {billing.country && COUNTRY_STATES[billing.country] ? (
                      <select
                        name="state"
                        value={billing.state}
                        onChange={onChange}
                      >
                        <option value="">Select state...</option>
                        {COUNTRY_STATES[billing.country].map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="state"
                        placeholder="State"
                        value={billing.state}
                        onChange={onChange}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <select
                      name="country"
                      value={billing.country}
                      onChange={onChange}
                      style={{ minWidth: 220 }}
                    >
                      <option value="">Select country...</option>
                      {Object.entries(COUNTRIES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                      <option value="OTHER">Other (enter name below)</option>
                    </select>
                  </div>
                  {billing.country === "OTHER" ? (
                    <div style={{ marginTop: 8 }}>
                      <input
                        name="country"
                        placeholder="Country name"
                        value={
                          billing.country === "OTHER"
                            ? billing.other_country || ""
                            : billing.country || ""
                        }
                        onChange={(e) =>
                          setBilling((prev) => ({
                            ...prev,
                            other_country: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ) : null}
                </div>

                {user ? (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={saveToProfile} disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save to profile"}
                    </button>
                    {message ? (
                      <span style={{ marginLeft: 12 }}>{message}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}


            {/* Stripe Payment Section with Elements */}
            <Elements
              stripe={stripePromise}
              options={{
                mode: "payment",
                amount: Math.round(displayTotal * 100) || 100, // Convert AED to fils (1 AED = 100 fils)
                currency: "aed",
                appearance: { theme: "stripe" },
                paymentMethodCreation: "manual", // Required for createPaymentMethod
              }}
            >
              <StripePaymentForm
                billing={billing}
                user={user}
                appliedCoupon={appliedCoupon}
                clearCart={clearCart}
                setResult={setResult}
                displayTotal={Math.round(displayTotal * 100) || 100} // Pass in fils
              />
            </Elements>

            {/* Alternative: Place order without payment (for testing/COD) */}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={placeOrder}
                disabled={placing}
                style={{
                  padding: '12px 24px',
                  borderRadius: 6,
                  fontSize: 16,
                  cursor: placing ? 'not-allowed' : 'pointer',
                  opacity: placing ? 0.6 : 1,
                  width: '100%',
                }}
              >
                {placing ? "Placing…" : "Place order (without payment)"}
              </button>
            </div>

            {result && (
              <div style={{ marginTop: 12, padding: 12, backgroundColor: result.ok ? '#d4edda' : '#f8d7da', borderRadius: 6 }}>
                {result.ok
                  ? result.message || `Order created: ${result.order_id || "id"}`
                  : `Error: ${result.error}`}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Your cart is empty</div>
      )}
    </div>
  );
}
