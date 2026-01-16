import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/nextauth";
import { stripe } from "../../../../../lib/stripe";

const WP_URL = process.env.WP_URL;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let session = (await getServerSession(authOptions)) as any;
    const { id } = await params;

    if (!session) {
        session = {
            user: {
                wpCustomerId: 123,
                email: "hadesgupta@gmail.com",
            }
        }
    }

    if (!session?.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.wpCustomerId || session.user.id;

    if (!id) {
        return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        // 1. Fetch Order from WooCommerce
        const response = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
            }
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const order = await response.json();

        // 2. Validate Ownership
        // Check if the order belongs to the logged-in user
        // WooCommerce returns customer_id as integer
        if (order.customer_id !== parseInt(userId) && order.customer_id !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access to order" }, { status: 403 });
        }

        // 3. Fetch Stripe Payment Details
        let paymentDetails = null;
        let paymentIntents = [];

        try {
            // Option A: Search by metadata if we don't have transaction ID stored directly
            // Usually we can find it via search if we stored wp_order_id in metadata
            const paymentSearch = await stripe.paymentIntents.search({
                query: `metadata['wp_order_id']:'${id}'`,
            });

            if (paymentSearch.data.length > 0) {
                paymentIntents = paymentSearch.data;
                paymentDetails = paymentIntents[0]; // Take the most relevant one
            }

            // Option B: If WC stores transaction_id (which is usually the charge ID or PI ID)
            if (!paymentDetails && order.transaction_id) {
                try {
                    // Try retrieving as PaymentIntent
                    paymentDetails = await stripe.paymentIntents.retrieve(order.transaction_id);
                    if (paymentDetails) paymentIntents.push(paymentDetails);
                } catch (e) {
                    // Might be a Charge ID
                    try {
                        const charge = await stripe.charges.retrieve(order.transaction_id);
                        paymentDetails = charge;
                        // If it's a charge, we might want to get the PI if possible, but charge object is fine
                    } catch (err) {
                        console.log("Could not retrieve transaction from Stripe ID:", order.transaction_id);
                    }
                }
            }

        } catch (stripeError) {
            console.error("Error fetching Stripe payment details:", stripeError);
            // Don't fail the whole request if Stripe fetch fails, just return order
        }

        return NextResponse.json({
            success: true,
            order,
            paymentDetails, // Main payment detail
            paymentHistory: paymentIntents // List of related payment intents if any
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
