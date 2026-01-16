import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";

const WP_API_BASE = process.env.WP_URL ? process.env.WP_URL.replace(/\/$/, "") : "";

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);
        const body = await req.json();
        const { deliveryOption, address, email, couponCode, cart, taxLabel,
            taxPercent,
            taxRateId,
            shippingCost,
            shippingMethodId, finalPrice } = body;

        // Validate address
        if (!address?.shipping) {
            return NextResponse.json({ success: false, message: "Invalid Address" }, { status: 400 });
        }

        // Validate cart data (should be passed from stripe checkout with discounts already applied)
        if (!cart || !cart.products || cart.products.length === 0) {
            return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
        }

        // Save address to user profile metadata if requested
        if (address?.saveAddress && address.shipping && session?.user) {
            try {
                const formattedAddress = {
                    label: address.shipping.label || "Home Address",
                    country: address.shipping.country || "",
                    firstName: address.shipping.firstName || "",
                    lastName: address.shipping.lastName || "",
                    address: address.shipping.address || "",
                    apartment: address.shipping.apartment || "",
                    city: address.shipping.city || "",
                    state: address.shipping.state || "",
                    phone: address.shipping.phone || "",
                    postalCode: address.shipping.postalCode || ""
                };

                const response = await fetch(`${process.env.NEXTAUTH_URL}/api/website/profile/address/update`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        cookie: req.headers.get("cookie") || "",
                    },
                    body: JSON.stringify({
                        ...formattedAddress
                        // No address_id implies CREATE
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    console.log("Failed to save address", data);
                }
            } catch (error) {
                console.log("Error updating address in order create", error);
            }
        }

        // Build line items from cart (prices already have discounts applied)
        const line_items = cart.products.map((item: any) => ({
            product_id: item.product_id,
            variation_id: item.variation_id || undefined,
            quantity: item.quantity,
            subtotal: String(item.price.product_subtotal),
            total: String(item.price.product_subtotal)
        }));

        // Build payload based on session and deliveryOption
        let payload: any;

        if (session?.user) {
            if (deliveryOption === "ship") {

                const cleanNumber = (address.shipping.phone || "").replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }

                payload = {
                    customer_id: session.user.wpCustomerId,
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    status: "pending",
                    set_paid: false,
                    billing: {
                        first_name: address.shippingAsbillingAddress ? address.shipping.firstName : address.billing.firstName,
                        last_name: address.shippingAsbillingAddress ? address.shipping.lastName : address.billing.lastName,
                        address_1: address.shippingAsbillingAddress ? address.shipping.address : address.billing.address,
                        city: address.shippingAsbillingAddress ? address.shipping.city : address.billing.city,
                        state: address.shippingAsbillingAddress ? address.shipping.state : address.billing.state,
                        postcode: address.shippingAsbillingAddress ? address.shipping.postalCode : address.billing.postalCode,
                        country: address.shippingAsbillingAddress ? address.shipping.country : address.billing.country,
                        email: email || session.user.email,
                        phone: address.shippingAsbillingAddress ? address.shipping.phone : address.billing.phone,
                    },
                    shipping: {
                        first_name: address.shipping.firstName,
                        last_name: address.shipping.lastName,
                        address_1: address.shipping.address,
                        city: address.shipping.city,
                        state: address.shipping.state,
                        postcode: address.shipping.postalCode,
                        country: address.shipping.country,
                    },
                    line_items,
                    coupon_lines: couponCode ? [
                        { code: couponCode }
                    ] : [],
                    shipping_lines: [
                        {
                            method_id: shippingMethodId,
                            method_title: "Flat Rate",
                            total: String(shippingCost)
                        }
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String(((finalPrice + shippingCost) * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: "ship"
                        },
                        {
                            key: "delivery_status",
                            value: "orderPlaced"
                        }
                    ]
                };
            } else if (deliveryOption === "pickup") {

                const cleanNumber = (address.billing.phone || "").replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }
                payload = {
                    customer_id: session.user.wpCustomerId,
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    status: "pending",
                    set_paid: false,
                    billing: {
                        first_name: address.shippingAsbillingAddress ? address.shipping.firstName : address.billing.firstName,
                        last_name: address.shippingAsbillingAddress ? address.shipping.lastName : address.billing.lastName,
                        address_1: address.shippingAsbillingAddress ? address.shipping.address : address.billing.address,
                        city: address.shippingAsbillingAddress ? address.shipping.city : address.billing.city,
                        state: address.shippingAsbillingAddress ? address.shipping.state : address.billing.state,
                        postcode: address.shippingAsbillingAddress ? address.shipping.postalCode : address.billing.postalCode,
                        country: address.shippingAsbillingAddress ? address.shipping.country : address.billing.country,
                        email: email || session.user.email,
                        phone: address.shippingAsbillingAddress ? address.shipping.phone : address.billing.phone,
                    },
                    shipping: {
                        first_name: "",
                        last_name: "",
                        address_1: "",
                        city: "",
                        state: "",
                        postcode: "",
                        country: "",
                    },
                    line_items,
                    coupon_lines: couponCode ? [
                        { code: couponCode }
                    ] : [],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String(((finalPrice) * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: "pickup"
                        },
                        {
                            key: "delivery_status",
                            value: "orderPlaced"
                        }
                    ]
                };
            }
        } else {
            // Guest user
            if (deliveryOption === "ship") {

                const cleanNumber = (address.shipping.phone || "").replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }

                payload = {
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    status: "pending",
                    set_paid: false,
                    billing: {
                        first_name: address.billing.firstName,
                        last_name: address.billing.lastName,
                        address_1: address.billing.address,
                        city: address.billing.city,
                        state: address.billing.state,
                        postcode: address.billing.postalCode,
                        country: address.billing.country,
                        email: email,
                        phone: address.billing.phone,
                    },
                    shipping: {
                        first_name: address.shipping.firstName,
                        last_name: address.shipping.lastName,
                        address_1: address.shipping.address,
                        city: address.shipping.city,
                        state: address.shipping.state,
                        postcode: address.shipping.postalCode,
                        country: address.shipping.country,
                    },
                    line_items,
                    coupon_lines: couponCode ? [
                        { code: couponCode }
                    ] : [],
                    shipping_lines: [
                        {
                            method_id: shippingMethodId,
                            method_title: "Flat Rate",
                            total: String(shippingCost)
                        }
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String(((finalPrice + shippingCost) * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: "ship"
                        },
                        {
                            key: "delivery_status",
                            value: "orderPlaced"
                        }
                    ]
                };
            } else {

                const cleanNumber = (address.billing.phone || "").replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }

                payload = {
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    status: "pending",
                    set_paid: false,
                    billing: {
                        first_name: address.billing.firstName,
                        last_name: address.billing.lastName,
                        address_1: address.billing.address,
                        city: address.billing.city,
                        state: address.billing.state,
                        postcode: address.billing.postalCode,
                        country: address.billing.country,
                        email: email,
                        phone: address.billing.phone,
                    },
                    shipping: {
                        first_name: "",
                        last_name: "",
                        address_1: "",
                        city: "",
                        state: "",
                        postcode: "",
                        country: "",
                    },
                    line_items,
                    coupon_lines: couponCode ? [
                        { code: couponCode }
                    ] : [],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String(((finalPrice) * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: "pickup"
                        },
                        {
                            key: "delivery_status",
                            value: "orderPlaced"
                        }
                    ]
                };
            }
        }


        const authHeader =
            "Basic " +
            Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

        // Generate guest access token for non-logged-in users
        let guestAccessToken = null;
        if (!session?.user) {
            // Create a unique token for guest access
            guestAccessToken = Buffer.from(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`).toString('base64');

            // Add token to metadata
            if (!payload.meta_data) {
                payload.meta_data = [];
            }
            payload.meta_data.push({
                key: "guest_access_token",
                value: guestAccessToken
            });

            console.log("🔑 Generated guest access token for order");
        }

        try {
            const url = `${WP_API_BASE}/wp-json/wc/v3/orders`;

            console.log("📦 Sending to WooCommerce - coupon_lines:", payload.coupon_lines);

            const res = await fetch(url, {
                method: "POST",
                headers: { Authorization: authHeader, "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const orderData = await res.json();

            if (!res.ok) {
                console.log("Error creating order", orderData);
                return NextResponse.json({
                    success: false,
                    message: "Error creating order",
                }, { status: 400 });
            }

            return NextResponse.json({
                success: true,
                orderData,
                guestAccessToken, // Return token to be used in redirect URL
                message: "Order created successfully"
            }, { status: 200 });

        } catch (error) {
            console.log("Error in creating order in order/create route", error);
            return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error processing order creation:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
