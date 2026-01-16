import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/nextauth";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || process.env.WP_URL;

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);
        const body = await req.json();
        const { deliveryOption, address, productDetails, email, taxData, shippingData } = body;

        // Extract tax and shipping data with defaults
        const taxRateId = taxData?.taxRateId || "";
        const taxPercent = taxData?.taxPercent || 0;
        const taxLabel = taxData?.taxLabel || "";

        if (!productDetails) {
            return NextResponse.json({ success: false, message: "Invalid Product Id" }, { status: 400 })
        }

        if (!address.shipping) {
            return NextResponse.json({ success: false, message: "Invalid Address" }, { status: 400 })
        }

        if (productDetails.in_stock === "outOfStock") {
            return NextResponse.json({ success: false, message: "Product is out of stock" }, { status: 400 })
        }

        // Save address to user profile metadata
        if (address?.saveAddress && address.shipping) {
            try {
                // Format address to only include the required fields
                const formattedAddress = {
                    label: address.shipping.label || "Home Address",
                    country: address.shipping.country || "",
                    firstName: address.shipping.firstName || "",
                    lastName: address.shipping.lastName || "",
                    address: address.shipping.address || "",
                    apartment: address.shipping.apartment || "",
                    city: address.shipping.city || "",
                    state: address.shipping.state || "", // Emirate dropdown value
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
                    return NextResponse.json(data, { status: 400 });
                }
            } catch (error) {
                console.log("Error updating address in subscription create", error)
            }
        }

        const frequency =
            productDetails.attributes["attribute_pa_simple-subscription-frequenc"];

        const [interval, period] = frequency.split("-");

        const frequencyInterval = Number(interval);
        const frequencyPeriod = period;

        const discount = productDetails.subscription_details.subscription_discount;
        const finalPrice = Number(productDetails.price) - ((productDetails.price * discount) / 100);

        let payload: any
        if (session?.user) {
            if (deliveryOption === "ship") {
                const cleanNumber = address.shipping.phone.replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }
                payload = {
                    customer_id: session?.user?.wpCustomerId,
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    billing_period: frequencyPeriod,
                    billing_interval: frequencyInterval,
                    status: "pending",
                    billing: {
                        first_name: address.shippingAsbillingAddress ? address.shipping.firstName : address.billing.firstName,
                        last_name: address.shippingAsbillingAddress ? address.shipping.lastName : address.billing.lastName,
                        address_1: address.shippingAsbillingAddress ? address.shipping.address : address.billing.address,
                        city: address.shippingAsbillingAddress ? address.shipping.city : address.billing.city,
                        state: address.shippingAsbillingAddress ? address.shipping.state : address.billing.state,
                        postcode: address.shippingAsbillingAddress ? address.shipping.postalCode : address.billing.postalCode,
                        country: address.shippingAsbillingAddress ? address.shipping.country : address.billing.country,
                        email: email || session?.user?.email,
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
                    line_items: [
                        {
                            product_id: productDetails.id,
                            subtotal: String(finalPrice),
                            total: String(finalPrice),
                            price: String(finalPrice),
                        },
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String((finalPrice * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: deliveryOption // Use the actual deliveryOption parameter
                        },
                        {
                            key: "delivery_status",
                            value: "orderPlaced"
                        }
                    ]
                };
            }
            else {

                const cleanNumber = address.billing.phone.replace(/\D/g, '');
                const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
                const match = cleanNumber.match(uaeRegex);

                if (!match) {
                    return NextResponse.json(
                        { success: false, message: "Invalid phone number" },
                        { status: 400 }
                    );
                }
                payload = {
                    customer_id: session?.user?.wpCustomerId,
                    payment_method: "stripe",
                    payment_method_title: "Stripe",
                    billing_period: frequencyPeriod,
                    billing_interval: frequencyInterval,
                    status: "pending",
                    billing: {
                        first_name: address.shippingAsbillingAddress ? address.shipping.firstName : address.billing.firstName,
                        last_name: address.shippingAsbillingAddress ? address.shipping.lastName : address.billing.lastName,
                        address_1: address.shippingAsbillingAddress ? address.shipping.address : address.billing.address,
                        city: address.shippingAsbillingAddress ? address.shipping.city : address.billing.city,
                        state: address.shippingAsbillingAddress ? address.shipping.state : address.billing.state,
                        postcode: address.shippingAsbillingAddress ? address.shipping.postalCode : address.billing.postalCode,
                        country: address.shippingAsbillingAddress ? address.shipping.country : address.billing.country,
                        email: email || session?.user?.email,
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
                    line_items: [
                        {
                            product_id: productDetails.id,
                            subtotal: String(finalPrice),
                            total: String(finalPrice),
                            price: String(finalPrice),
                        },
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String((finalPrice * taxPercent) / 100),
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
        else {
            if (deliveryOption === "ship") {
                const cleanNumber = address.shipping.phone.replace(/\D/g, '');
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
                    billing_period: frequencyPeriod,
                    billing_interval: frequencyInterval,
                    status: "pending",
                    billing: {
                        first_name: address.billing.firstName,
                        last_name: address.billing.lastName,
                        address_1: address.billing.address,
                        city: address.billing.city,
                        state: address.billing.state,
                        postcode: address.billing.postalCode,
                        country: address.billing.country,
                        email: email || session?.user?.email,
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
                    line_items: [
                        {
                            product_id: productDetails.id,
                            subtotal: String(finalPrice),
                            total: String(finalPrice),
                            price: String(finalPrice),
                        },
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String((finalPrice * taxPercent) / 100),
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
                const cleanNumber = address.shipping.phone.replace(/\D/g, '');
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
                    billing_period: frequencyPeriod,
                    billing_interval: frequencyInterval,
                    status: "pending",
                    billing: {
                        first_name: address.billing.firstName,
                        last_name: address.billing.lastName,
                        address_1: address.billing.address,
                        city: address.billing.city,
                        state: address.billing.state,
                        postcode: address.billing.postalCode,
                        country: address.billing.country,
                        email: email || session?.user?.email,
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
                    line_items: [
                        {
                            product_id: productDetails.id,
                            subtotal: String(finalPrice),
                            total: String(finalPrice),
                            price: String(finalPrice),
                        },
                    ],
                    tax_lines: taxRateId ? [
                        {
                            rate_id: taxRateId,
                            tax_total: String((finalPrice * taxPercent) / 100),
                            label: taxLabel
                        }
                    ] : [],
                    meta_data: [
                        {
                            key: "delivery_option",
                            value: deliveryOption // Use the actual deliveryOption parameter
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


        try {
            const res = await fetch(`${WP_URL}/wp-json/wc/v3/subscriptions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                console.log("Error creating subscription", data)
                return NextResponse.json({
                    success: false,
                    message: "Error creating subscription",
                }, { status: 400 });
            }

            return NextResponse.json({
                success: true,
                subscriptionData: data
            }, { status: 200 });

        } catch (error) {
            console.log(error)
            // Fix: Actually return an error response if fetch fails
            return NextResponse.json({ success: false, message: "Failed to create subscription in WC" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error processing subscription creation:", error);
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}