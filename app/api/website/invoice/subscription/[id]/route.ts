import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/nextauth";
import { stripe } from "../../../../../../lib/stripe";
import { formatSubscriptionToInvoice } from "../../../../../../lib/pdf/utils/invoiceFormatter";
import { generateInvoicePDF, generateInvoiceFilename } from "../../../../../../lib/pdf/utils/pdfGenerator";

const WP_URL = process.env.WP_URL;

export async function GET(
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
        let latestInvoice = null;

        try {
            // Check for Stripe Subscription ID in metadata
            const stripeSubIdMeta = subscription.meta_data.find((m: any) =>
                m.key === '_stripe_subscription_id' || m.key === 'stripe_subscription_id'
            );

            let stripeSubId = stripeSubIdMeta?.value;

            // Search Stripe if not found in metadata
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

                // Fetch Latest Invoice
                if (stripeSubscription.latest_invoice) {
                    const invoiceId = typeof stripeSubscription.latest_invoice === 'string'
                        ? stripeSubscription.latest_invoice
                        : stripeSubscription.latest_invoice.id;

                    latestInvoice = await stripe.invoices.retrieve(invoiceId);
                }
            }
        } catch (stripeError) {
            console.error("Error fetching Stripe subscription details:", stripeError);
        }

        // 4. Format data for invoice
        const invoiceData = formatSubscriptionToInvoice(subscription, stripeSubscription, latestInvoice);

        // 5. Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // 6. Generate filename
        const filename = generateInvoiceFilename(invoiceData.metadata.invoiceNumber, 'subscription');

        // 7. Return PDF as response
        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });

    } catch (error: any) {
        console.error("Error generating subscription invoice:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to generate invoice",
            error: error.message
        }, { status: 500 });
    }
}
