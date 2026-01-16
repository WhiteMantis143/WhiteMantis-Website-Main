"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddressFormData {
    label: string;
    country: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    phone: string;
    postalCode: string;
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

// Sample cart items - replace with actual cart data
const sampleCartItems: CartItem[] = [
    {
        id: "1",
        name: "Premium Wireless Headphones",
        price: 12999,
        quantity: 1,
        image: "https://via.placeholder.com/80"
    },
    {
        id: "2",
        name: "Smart Watch Series 5",
        price: 24999,
        quantity: 2,
        image: "https://via.placeholder.com/80"
    },
    {
        id: "3",
        name: "Laptop Stand Aluminum",
        price: 2999,
        quantity: 1,
        image: "https://via.placeholder.com/80"
    },
];

// Payment Form Component (must be inside Elements provider)
function PaymentForm({
    cartItems,
    subtotal,
    tax,
    total,
    email,
    isGuestUser,
    addressForm,
    savedAddresses,
    handleAddressChange,
    loadSavedAddress,
    formatPrice,
    subscriptionProductId,
    subscriptionVariationId,
    setSubscriptionProductId,
    setSubscriptionVariationId,
    guestEmail,
    setGuestEmail
}: any) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [clientSecret, setClientSecret] = useState<string | null>(null);


    const handlePayment = async () => {
        if (!stripe || !elements) {
            setErrorMessage("Stripe has not loaded yet. Please wait.");
            return;
        }

        // Validate required fields
        if (!subscriptionProductId) {
            setErrorMessage("Please enter a Subscription Product ID");
            return;
        }

        setIsProcessing(true);
        setErrorMessage("");

        try {
            // Step 1: Submit the Elements form (required before createPaymentMethod)
            const { error: submitError } = await elements.submit();
            if (submitError) {
                console.error("Error submitting form:", submitError);
                setErrorMessage(submitError.message || "Failed to submit form");
                setIsProcessing(false);
                return;
            }

            // Step 2: Create PaymentMethod from Stripe Elements
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                elements,
                params: {
                    billing_details: {
                        email: email || guestEmail,
                        address: {
                            line1: addressForm.address,
                            line2: addressForm.apartment,
                            city: addressForm.city,
                            postal_code: addressForm.postalCode,
                            country: addressForm.country,
                            state: addressForm.state,
                        },
                    },
                },
            });

            if (pmError) {
                console.error("Error creating payment method:", pmError);
                setErrorMessage(pmError.message || "Failed to create payment method");
                setIsProcessing(false);
                return;
            }

            console.log("✅ PaymentMethod created:", paymentMethod.id);

            // Step 2: Prepare the body matching your API structure
            const requestBody = {
                checkout: {
                    type: "subscription",
                    subscriptionProductId: subscriptionProductId,
                    ...(subscriptionVariationId && { subscriptionProductVariationId: subscriptionVariationId })
                },
                deliveryOption: "ship",
                address: {
                    billing: {
                        label: addressForm.label || "Home Address",
                        country: addressForm.country || "",
                        firstName: addressForm.firstName || "",
                        lastName: addressForm.lastName || "",
                        address: addressForm.address || "",
                        apartment: addressForm.apartment || "",
                        city: addressForm.city || "",
                        state: addressForm.state || "",
                        phone: addressForm.phone || "",
                        postalCode: addressForm.postalCode || ""
                    },
                    shipping: {
                        label: addressForm.label || "Home Address",
                        country: addressForm.country || "",
                        firstName: addressForm.firstName || "",
                        lastName: addressForm.lastName || "",
                        address: addressForm.address || "",
                        apartment: addressForm.apartment || "",
                        city: addressForm.city || "",
                        state: addressForm.state || "",
                        phone: addressForm.phone || "",
                        postalCode: addressForm.postalCode || ""
                    },
                    addressId: `addr_${Date.now()}`,
                    shippingAsbillingAddress: true,
                    saveAddress: true
                },
                paymentMethodId: paymentMethod.id,
                email: email || guestEmail
            };

            console.log("📤 Sending to create-checkout-session:", requestBody);

            // Step 3: Send to backend
            const response = await fetch("/api/website/stripe/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            console.log("📥 API Response:", result);

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
            }
            if (!response.ok) {
                throw new Error(result.message || "Failed to create checkout session");
            }

            if (result.success && result.clientSecret) {
                console.log("💳 Confirming payment on frontend...");

                // Step 4: Confirm the payment on the frontend (handles 3D Secure)
                const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                    elements,
                    clientSecret: result.clientSecret,
                    confirmParams: {
                        return_url: window.location.origin + "/checkout/success",
                        // DO NOT pass payment_method here if you already 
                        // attached it during subscription create
                    },
                    redirect: "if_required",
                });

                if (confirmError) {
                    setErrorMessage(confirmError.message);
                    setIsProcessing(false);
                    return;
                }
                if (paymentIntent && paymentIntent.status === "succeeded") {
                    console.log("✅ Payment succeeded! Subscription is now ACTIVE!");

                    // Redirect to success page with subscription ID and type
                    window.location.href = `/checkout/success?type=subscription&id=${result.subscriptionId}`;
                } else {
                    console.log("⚠️ Payment status:", paymentIntent?.status);
                    setErrorMessage("Payment was not successful. Please try again.");
                }
            } else {
                console.log("⚠️ No client secret returned");
                setErrorMessage("Failed to get payment confirmation details");
            }

        } catch (error: any) {
            console.error("❌ Error processing payment:", error);
            setErrorMessage(error.message || "Failed to process payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Subscription Product Details */}
            <div style={styles.addressFormSection}>
                <h2 style={styles.formTitle}>Subscription Details</h2>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>SUBSCRIPTION PRODUCT ID *</label>
                    <input
                        type="text"
                        value={subscriptionProductId}
                        onChange={(e) => setSubscriptionProductId(e.target.value)}
                        placeholder="e.g., 937"
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>VARIATION ID (Optional for Variable Subscriptions)</label>
                    <input
                        type="text"
                        value={subscriptionVariationId}
                        onChange={(e) => setSubscriptionVariationId(e.target.value)}
                        placeholder="e.g., 941"
                        style={styles.input}
                    />
                </div>
            </div>

            {/* Email Section - Display for logged-in users, Input for guests */}
            <div style={styles.emailDisplaySection}>
                <label style={styles.formLabel}>EMAIL ADDRESS</label>
                {email ? (
                    // Logged-in user: show email as read-only
                    <div style={styles.emailDisplay}>
                        {email}
                    </div>
                ) : (
                    // Guest user: show input field
                    <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Enter your email address"
                        style={styles.input}
                        required
                    />
                )}
            </div>

            {/* Saved Address Selector */}
            {savedAddresses.length > 0 && (
                <div style={styles.sectionBox}>
                    <label style={styles.label}>Saved Address</label>
                    <select
                        onChange={(e) => loadSavedAddress(e.target.value)}
                        style={styles.select}
                    >
                        <option value="">Choose address...</option>
                        {savedAddresses.map((addr: any) => (
                            <option key={addr.id} value={addr.id}>
                                {addr.label} — {addr.city}, {addr.state}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Custom Address Form */}
            <div style={styles.addressFormSection}>
                <h2 style={styles.formTitle}>Add New Address</h2>

                {/* Address Label */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>ADDRESS LABEL</label>
                    <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => handleAddressChange("label", e.target.value)}
                        placeholder="Home, Office, etc."
                        style={styles.input}
                    />
                </div>

                {/* First Name and Last Name */}
                <div style={styles.formRow}>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>FIRST NAME</label>
                        <input
                            type="text"
                            value={addressForm.firstName}
                            onChange={(e) => handleAddressChange("firstName", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>LAST NAME</label>
                        <input
                            type="text"
                            value={addressForm.lastName}
                            onChange={(e) => handleAddressChange("lastName", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* Address Lines */}
                <div style={styles.formRow}>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>ADDRESS</label>
                        <input
                            type="text"
                            value={addressForm.address}
                            onChange={(e) => handleAddressChange("address", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>APARTMENT / SUITE</label>
                        <input
                            type="text"
                            value={addressForm.apartment}
                            onChange={(e) => handleAddressChange("apartment", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* City and Postal Code */}
                <div style={styles.formRow}>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>CITY</label>
                        <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>POSTAL CODE</label>
                        <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* Country and State */}
                <div style={styles.formRow}>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>COUNTRY</label>
                        <select
                            value={addressForm.country}
                            onChange={(e) => handleAddressChange("country", e.target.value)}
                            style={styles.input}
                        >
                            <option value="">Select country...</option>
                            <option value="AE">United Arab Emirates</option>
                            <option value="IN">India</option>
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                        </select>
                    </div>
                    <div style={styles.formGroupHalf}>
                        <label style={styles.formLabel}>STATE / REGION</label>
                        <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => handleAddressChange("state", e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>

                {/* Phone Number */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>PHONE NUMBER</label>
                    <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => handleAddressChange("phone", e.target.value)}
                        style={styles.input}
                    />
                </div>
            </div>

            {/* Main Payment Element */}
            <div style={styles.section}>
                <PaymentElement />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div style={styles.errorMessage}>
                    {errorMessage}
                </div>
            )}

            {/* Pay Button */}
            <button
                style={{
                    ...styles.payBtn,
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
                onClick={handlePayment}
                disabled={isProcessing || !stripe || !elements}
            >
                {isProcessing ? "Processing..." : `Pay ${formatPrice(total)}`}
            </button>
        </>
    );
}

export default function CheckoutPage({ cartItems = sampleCartItems }) {
    const { data: session, status } = useSession();
    const [clientReady, setClientReady] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isGuestUser, setIsGuestUser] = useState(false);
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        label: "",
        country: "",
        firstName: "",
        lastName: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        phone: "",
        postalCode: "",
    });
    const [subscriptionProductId, setSubscriptionProductId] = useState("937"); // Hardcoded for testing
    const [subscriptionVariationId, setSubscriptionVariationId] = useState("941"); // Hardcoded for testing
    const [guestEmail, setGuestEmail] = useState(""); // For guest users
    const email = session?.user?.email || "";

    // Fetch saved addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await fetch('/api/website/profile/get-addresses');
                const data = await response.json();

                if (data.success) {
                    setIsGuestUser(data.guestuser);

                    if (!data.guestuser && data.addresses && data.addresses.length > 0) {
                        setSavedAddresses(data.addresses);

                        // Find default address or use first one
                        const defaultAddr = data.addresses.find((addr: any) => addr.is_default === true);
                        const addressToLoad = defaultAddr || data.addresses[0];

                        if (addressToLoad) {
                            setAddressForm({
                                label: addressToLoad.label || "",
                                country: addressToLoad.country || "",
                                firstName: addressToLoad.firstName || "",
                                lastName: addressToLoad.lastName || "",
                                address: addressToLoad.address || "",
                                apartment: addressToLoad.apartment || "",
                                city: addressToLoad.city || "",
                                state: addressToLoad.state || "",
                                phone: addressToLoad.phone || "",
                                postalCode: addressToLoad.postalCode || "",
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
            }
        };

        if (status !== "loading") {
            fetchAddresses();
        }
    }, [status]);

    useEffect(() => {
        // Wait for session to be loaded before showing Stripe elements
        if (status !== "loading") {
            setClientReady(true);
        }
    }, [status]);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% VAT
    const total = subtotal + tax;


    // Inside CheckoutPage component
    const options = {
        appearance: { theme: "stripe" as const },
        paymentMethodCreation: "manual" as const,
        // ADD THESE THREE LINES:
        mode: "payment" as const,
        amount: total, // Use the 'total' variable calculated above
        currency: "aed",
    };


    const handleAddressChange = (field: keyof AddressFormData, value: string | boolean) => {
        setAddressForm(prev => ({ ...prev, [field]: value }));
    };

    const loadSavedAddress = (addressId: string) => {
        const addr = savedAddresses.find((a: any) => a.id === addressId);
        if (addr) {
            setAddressForm({
                label: addr.label || "",
                country: addr.country || "",
                firstName: addr.firstName || "",
                lastName: addr.lastName || "",
                address: addr.address || "",
                apartment: addr.apartment || "",
                city: addr.city || "",
                state: addr.state || "",
                phone: addr.phone || "",
                postalCode: addr.postalCode || "",
            });
        }
    };

    const formatPrice = (price: number) => {
        return `AED ${(price / 100).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };


    if (!clientReady) return null;

    return (
        <div style={styles.pageBg}>


            <div style={styles.container}>
                {/* Left Side - Order Summary */}
                <div style={styles.leftColumn}>
                    <h2 style={styles.summaryTitle}>Order Summary</h2>

                    {/* Cart Items */}
                    <div style={styles.cartItems}>
                        {cartItems.map((item) => (
                            <div key={item.id} style={styles.cartItem}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    style={styles.itemImage}
                                />
                                <div style={styles.itemDetails}>
                                    <h3 style={styles.itemName}>{item.name}</h3>
                                    <p style={styles.itemPrice}>
                                        {formatPrice(item.price)} × {item.quantity}
                                    </p>
                                </div>
                                <div style={styles.itemTotal}>
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div style={styles.priceBreakdown}>
                        <div style={styles.priceRow}>
                            <span style={styles.priceLabel}>Subtotal</span>
                            <span style={styles.priceValue}>{formatPrice(subtotal)}</span>
                        </div>
                        <div style={styles.priceRow}>
                            <span style={styles.priceLabel}>Tax (18%)</span>
                            <span style={styles.priceValue}>{formatPrice(tax)}</span>
                        </div>
                        <div style={styles.divider}></div>
                        <div style={styles.priceRow}>
                            <span style={styles.totalLabel}>Total</span>
                            <span style={styles.totalValue}>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Payment Form */}
                <div style={styles.rightColumn}>
                    <h1 style={styles.title}>Pay securely</h1>

                    <Elements stripe={stripePromise} options={options} key={email || "no-email"}>
                        <PaymentForm
                            cartItems={cartItems}
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                            email={email}
                            isGuestUser={isGuestUser}
                            addressForm={addressForm}
                            savedAddresses={savedAddresses}
                            handleAddressChange={handleAddressChange}
                            loadSavedAddress={loadSavedAddress}
                            formatPrice={formatPrice}
                            subscriptionProductId={subscriptionProductId}
                            subscriptionVariationId={subscriptionVariationId}
                            setSubscriptionProductId={setSubscriptionProductId}
                            setSubscriptionVariationId={setSubscriptionVariationId}
                            guestEmail={guestEmail}
                            setGuestEmail={setGuestEmail}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageBg: {
        minHeight: "100vh",
        background: "#f6f9fc",
        padding: "40px 20px",
    } as React.CSSProperties,
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "400px 1fr",
        gap: "32px",
    } as React.CSSProperties,
    leftColumn: {
        background: "#fff",
        padding: "28px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        height: "fit-content",
        position: "sticky" as const,
        top: "20px",
    } as React.CSSProperties,
    rightColumn: {
        background: "#fff",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
    } as React.CSSProperties,
    summaryTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#111",
        marginTop: 0,
        marginBottom: "24px",
    } as React.CSSProperties,
    cartItems: {
        marginBottom: "24px",
    } as React.CSSProperties,
    cartItem: {
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid #f0f0f0",
    } as React.CSSProperties,
    itemImage: {
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        objectFit: "cover" as const,
        border: "1px solid #e5e7eb",
    } as React.CSSProperties,
    itemDetails: {
        flex: 1,
    } as React.CSSProperties,
    itemName: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#111",
        margin: "0 0 6px 0",
    } as React.CSSProperties,
    itemPrice: {
        fontSize: "13px",
        color: "#666",
        margin: 0,
    } as React.CSSProperties,
    itemTotal: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#111",
        alignSelf: "center",
    } as React.CSSProperties,
    priceBreakdown: {
        marginTop: "20px",
    } as React.CSSProperties,
    priceRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px",
    } as React.CSSProperties,
    priceLabel: {
        fontSize: "14px",
        color: "#666",
    } as React.CSSProperties,
    priceValue: {
        fontSize: "14px",
        color: "#111",
        fontWeight: "500",
    } as React.CSSProperties,
    divider: {
        height: "1px",
        background: "#e5e7eb",
        margin: "16px 0",
    } as React.CSSProperties,
    totalLabel: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#111",
    } as React.CSSProperties,
    totalValue: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#111",
    } as React.CSSProperties,
    title: {
        fontSize: "24px",
        fontWeight: "600",
        color: "#111",
        marginTop: 0,
        marginBottom: "24px",
    } as React.CSSProperties,
    section: {
        marginBottom: "20px",
    } as React.CSSProperties,
    sectionBox: {
        background: "#fafafa",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
    } as React.CSSProperties,
    label: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#666",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
        marginBottom: "8px",
        display: "block",
    } as React.CSSProperties,
    select: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        background: "#fff",
        color: "#111",
    } as React.CSSProperties,
    addressFormSection: {
        background: "#fff",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
    } as React.CSSProperties,
    formTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#111",
        marginBottom: "20px",
        marginTop: 0,
    } as React.CSSProperties,
    formGroup: {
        marginBottom: "16px",
    } as React.CSSProperties,
    formGroupHalf: {
        flex: 1,
    } as React.CSSProperties,
    formRow: {
        display: "flex",
        gap: "16px",
        marginBottom: "16px",
    } as React.CSSProperties,
    formLabel: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#666",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
        marginBottom: "8px",
        display: "block",
    } as React.CSSProperties,
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        background: "#fff",
        color: "#111",
        boxSizing: "border-box" as const,
    } as React.CSSProperties,
    checkboxGroup: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "16px",
    } as React.CSSProperties,
    checkbox: {
        width: "16px",
        height: "16px",
        cursor: "pointer",
    } as React.CSSProperties,
    checkboxLabel: {
        fontSize: "14px",
        color: "#111",
        cursor: "pointer",
        userSelect: "none" as const,
    } as React.CSSProperties,
    payBtn: {
        width: "100%",
        background: "#000",
        color: "#fff",
        padding: "14px",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        border: "none",
        marginTop: "8px",
    } as React.CSSProperties,
    errorMessage: {
        background: "#fee",
        color: "#c33",
        padding: "12px",
        borderRadius: "6px",
        fontSize: "14px",
        marginBottom: "12px",
        border: "1px solid #fcc",
    } as React.CSSProperties,
    emailDisplaySection: {
        background: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "20px",
    } as React.CSSProperties,
    emailDisplay: {
        fontSize: "14px",
        color: "#111",
        fontWeight: "500",
        padding: "8px 0",
    } as React.CSSProperties,
};
