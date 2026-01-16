import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/nextauth";
import { stripe } from "../../../../../../lib/stripe";

const WP_URL = process.env.WP_URL;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = (await getServerSession(authOptions)) as any;
    const { id } = await params;

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
        // 1. FETCH FIRST: Get Subscription Details
        const response = await fetch(`${WP_URL}/wp-json/wc/v3/subscriptions/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: "Subscription not found" }, { status: 404 });
        }

        const subscription = await response.json();

        // 2. Validate Ownership
        if (subscription.customer_id !== parseInt(userId) && subscription.customer_id !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access to subscription" }, { status: 403 });
        }

        if (subscription.status === 'cancelled') {
            return NextResponse.json({ success: false, message: "Subscription is already cancelled" }, { status: 400 });
        }

        // 3. Cancel Stripe Subscription
        let stripeCancelStatus = "skipped";

        // Find Stripe Subscription ID
        const stripeSubIdMeta = subscription.meta_data.find((m: any) =>
            m.key === '_stripe_subscription_id' || m.key === 'stripe_subscription_id'
        );
        let stripeSubId = stripeSubIdMeta?.value;

        try {
            if (!stripeSubId) {
                // Try searching if not in metadata
                const search = await stripe.subscriptions.search({
                    query: `metadata['wp_subscription_id']:'${id}'`,
                });
                if (search.data.length > 0) {
                    stripeSubId = search.data[0].id;
                }
            }

            if (stripeSubId) {
                const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
                if (stripeSub.status !== 'canceled') {
                    await stripe.subscriptions.cancel(stripeSubId);
                    stripeCancelStatus = "cancelled";
                } else {
                    stripeCancelStatus = "already_cancelled";
                }
            } else {
                console.log(`No Stripe subscription found for WC Subscription ${id}`);
                stripeCancelStatus = "not_found";
            }
        } catch (stripeError) {
            console.error("Error cancelling Stripe subscription details:", stripeError);
            stripeCancelStatus = "error";
            // We usually proceed to cancel in WC anyway to stop local accrual, 
            // but log the error heavily.
        }

        // 4. Update WooCommerce Subscription Status
        const updateResponse = await fetch(`${WP_URL}/wp-json/wc/v3/subscriptions/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'cancelled',
                meta_data: [
                    { key: 'cancellation_reason', value: 'Customer requested cancellation via Website' },
                    { key: 'stripe_cancellation_status', value: stripeCancelStatus }
                ]
            }),
            cache: 'no-store'
        });

        if (!updateResponse.ok) {
            return NextResponse.json({ success: false, message: "Failed to update subscription status" }, { status: 500 });
        }

        const updatedSubscription = await updateResponse.json();

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled successfully",
            subscriptionId: id,
            newStatus: updatedSubscription.status,
            stripeStatus: stripeCancelStatus
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}