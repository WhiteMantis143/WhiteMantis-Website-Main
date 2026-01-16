import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/nextauth";
import { stripe } from "../../../../../../lib/stripe";
import { formatOrderToInvoice } from "../../../../../../lib/pdf/utils/invoiceFormatter";
import { generateInvoicePDF, generateInvoiceFilename } from "../../../../../../lib/pdf/utils/pdfGenerator";

const WP_URL = process.env.WP_URL;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = (await getServerSession(authOptions)) as any;
    const { id } = await params;

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
        if (order.customer_id !== parseInt(userId) && order.customer_id !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access to order" }, { status: 403 });
        }

        // 3. Fetch Stripe Payment Details
        let paymentDetails = null;

        try {
            // Search by metadata
            const paymentSearch = await stripe.paymentIntents.search({
                query: `metadata['wp_order_id']:'${id}'`,
            });

            if (paymentSearch.data.length > 0) {
                paymentDetails = paymentSearch.data[0];
            }

            // Fallback to transaction_id
            if (!paymentDetails && order.transaction_id) {
                try {
                    paymentDetails = await stripe.paymentIntents.retrieve(order.transaction_id);
                } catch (e) {
                    try {
                        const charge = await stripe.charges.retrieve(order.transaction_id);
                        paymentDetails = charge;
                    } catch (err) {
                        console.log("Could not retrieve transaction from Stripe ID:", order.transaction_id);
                    }
                }
            }
        } catch (stripeError) {
            console.error("Error fetching Stripe payment details:", stripeError);
        }

        // 4. Format data for invoice
        const invoiceData = formatOrderToInvoice(order, paymentDetails);

        // 5. Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // 6. Generate filename
        const filename = generateInvoiceFilename(invoiceData.metadata.invoiceNumber, 'order');

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
        console.error("Error generating order invoice:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to generate invoice",
            error: error.message
        }, { status: 500 });
    }
}
