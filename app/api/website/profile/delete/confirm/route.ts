import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/nextauth";
import { cookies } from "next/headers";
import { stripe } from "../../../../../../lib/stripe";
import { findCustomerByEmail } from "../../../../../../lib/woo";

const WP_URL = process.env.WP_URL!;

export async function POST(request: NextRequest) {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.email) {
        return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 401 }
        );
    }

    const email = session.user.email;
    let wcCustomerId = session.user.wpCustomerId;

    /**
     * --------------------------------------------------
     * STEP 1: Fetch WooCommerce customer (SOURCE OF TRUTH)
     * --------------------------------------------------
     */
    if (!wcCustomerId) {
        console.log(`⚠️ wpCustomerId missing in session, looking up by email: ${email}`);
        try {
            const customer = await findCustomerByEmail(email);
            if (customer) {
                wcCustomerId = customer.id;
                console.log(`✅ Found customer by email: ${wcCustomerId}`);
            } else {
                console.error(`❌ Customer not found by email: ${email}`);
                return NextResponse.json(
                    { success: false, message: "WooCommerce customer not found" },
                    { status: 404 }
                );
            }
        } catch (error) {
            console.error("Error finding customer by email:", error);
            return NextResponse.json(
                { success: false, message: "Error looking up customer" },
                { status: 500 }
            );
        }
    } else {
        console.log(`✅ Using existing wpCustomerId: ${wcCustomerId}`);
    }

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    const cancelledWooSubs: number[] = [];
    const cancelledStripeSubs: string[] = [];

    try {
        /**
         * --------------------------------------------------
         * STEP 2: Fetch ALL WooCommerce subscriptions (v3)
         * --------------------------------------------------
         */
        const subsRes = await fetch(
            `${WP_URL}/wp-json/wc/v3/subscriptions?customer=${wcCustomerId}&per_page=100`,
            {
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!subsRes.ok) {
            throw new Error("Failed to fetch WooCommerce subscriptions");
        }

        const subscriptions = await subsRes.json();

        /**
         * --------------------------------------------------
         * STEP 3: Cancel STRIPE subscriptions FIRST
         * (using subscription meta – most reliable)
         * --------------------------------------------------
         */
        for (const sub of subscriptions) {
            const stripeSubMeta =
                sub.meta_data?.find(
                    (m: any) =>
                        m.key === "_stripe_subscription_id" ||
                        m.key === "stripe_subscription_id"
                )?.value;

            if (stripeSubMeta) {
                try {
                    const stripeSub = await stripe.subscriptions.retrieve(stripeSubMeta);

                    if (stripeSub.status !== "canceled") {
                        await stripe.subscriptions.cancel(stripeSub.id);
                        cancelledStripeSubs.push(stripeSub.id);
                        console.log(`✅ Cancelled Stripe sub ${stripeSub.id}`);
                    }
                } catch (err) {
                    console.error(
                        `❌ Failed cancelling Stripe sub ${stripeSubMeta}`,
                        err
                    );
                }
            }
        }

        /**
         * --------------------------------------------------
         * STEP 4: Cancel ALL WooCommerce subscriptions
         * --------------------------------------------------
         */
        for (const sub of subscriptions) {
            if (
                ["cancelled", "expired", "trash"].includes(sub.status)
            ) {
                continue;
            }

            try {
                const cancelRes = await fetch(
                    `${WP_URL}/wp-json/wc/v3/subscriptions/${sub.id}`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: authHeader,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: "cancelled" }),
                    }
                );

                if (cancelRes.ok) {
                    cancelledWooSubs.push(sub.id);
                    console.log(`✅ Cancelled WC subscription ${sub.id}`);
                }
            } catch (err) {
                console.error(`❌ WC cancel failed for ${sub.id}`, err);
            }
        }

        /**
         * --------------------------------------------------
         * STEP 5: Delete WooCommerce customer
         * --------------------------------------------------
         */
        await fetch(
            `${WP_URL}/wp-json/wc/v3/customers/${wcCustomerId}?force=true`,
            {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                },
            }
        );

        /**
         * --------------------------------------------------
         * STEP 6: Clear cookies
         * --------------------------------------------------
         */
        const cookieStore = await cookies();
        cookieStore.getAll().forEach((c) => cookieStore.delete(c.name));

        return NextResponse.json({
            success: true,
            cancelledWooCommerceSubscriptions: cancelledWooSubs,
            cancelledStripeSubscriptions: cancelledStripeSubs,
            deletedCustomerId: wcCustomerId,
        });
    } catch (error: any) {
        console.error("Profile delete error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}