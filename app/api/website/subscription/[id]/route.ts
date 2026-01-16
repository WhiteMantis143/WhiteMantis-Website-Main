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

    // if (!session) {
    //     session = {
    //         user: {
    //             id: 123,
    //             email: "hadesgupta@gmail.com"
    //         }
    //     }
    // }

    if (!session?.user?.email) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.wpCustomerId || session.user.id;

    if (!id) {
        return NextResponse.json({ success: false, message: "Subscription ID is required" }, { status: 400 });
    }

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        // 1. Fetch Subscription from WooCommerce
        const response = await fetch(`${WP_URL}/wp-json/wc/v3/subscriptions/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ success: false, message: "Subscription not found" }, { status: 404 });
            }
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const subscription = await response.json();

        // 2. Validate Ownership
        if (subscription.customer_id !== parseInt(userId) && subscription.customer_id !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access to subscription" }, { status: 403 });
        }

        // 3. Fetch Stripe Data
        let stripeSubscription = null;
        let paymentHistory = [];

        // Check for Stripe Subscription ID in metadata
        // Usually stored as _stripe_subscription_id or similar by gateway, or we might have stored it in custom meta
        const stripeSubIdMeta = subscription.meta_data.find((m: any) =>
            m.key === '_stripe_subscription_id' || m.key === 'stripe_subscription_id'
        );

        // If not found, try to search Stripe for metadata match
        let stripeSubId = stripeSubIdMeta?.value;

        try {
            if (!stripeSubId) {
                const search = await stripe.subscriptions.search({
                    query: `metadata['wp_subscription_id']:'${id}'`,
                });
                if (search.data.length > 0) {
                    stripeSubId = search.data[0].id;
                }
            }

            if (stripeSubId) {
                // Fetch Subscription Details
                stripeSubscription = await stripe.subscriptions.retrieve(stripeSubId);

                // Fetch Invoices (Payment History)
                const invoices = await stripe.invoices.list({
                    subscription: stripeSubId,
                    limit: 12, // Last 12 payments
                });

                paymentHistory = invoices.data;
            } else {
                // Try searching by customer email if all else fails, though risky matching logic
                // Better to rely on metadata
            }

        } catch (stripeError) {
            console.error("Error fetching Stripe subscription details:", stripeError);
        }

        return NextResponse.json({
            success: true,
            subscription,
            stripeSubscription,
            paymentHistory, // Recent invoices
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching subscription:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
