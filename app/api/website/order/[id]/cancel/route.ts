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
        return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        // 1. FETCH FIRST: Get Order Details (Secure Pattern)
        const orderResponse = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!orderResponse.ok) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const order = await orderResponse.json();

        // 2. Validate Ownership
        if (order.customer_id !== parseInt(userId) && order.customer_id !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access to order" }, { status: 403 });
        }

        // 3. Check Eligibility (delivery_status === 'orderPlaced')
        const deliveryStatusMeta = order.meta_data.find((m: any) => m.key === "delivery_status");
        const deliveryStatus = deliveryStatusMeta?.value;

        if (deliveryStatus !== "orderPlaced") {
            return NextResponse.json({
                success: false,
                message: "Order cannot be cancelled. It may already be processed or shipped."
            }, { status: 400 });
        }

        // 4. Cancel/Refund Stripe Payment
        let refundId = null;
        let refundStatus = "none";

        // Try to find payment intent/charge from metadata or transaction_id
        // (Similar logic to GET route, but we need to ACT on it)
        try {
            let paymentId = order.transaction_id; // Default WC transaction ID

            // Search if not present directly
            if (!paymentId) {
                const search = await stripe.paymentIntents.search({
                    query: `metadata['wp_order_id']:'${id}'`,
                });
                if (search.data.length > 0) {
                    paymentId = search.data[0].id;
                }
            }

            if (paymentId) {
                // Determine if it's a PaymentIntent or Charge
                if (paymentId.startsWith('pi_')) {
                    const pi = await stripe.paymentIntents.retrieve(paymentId);
                    if (pi.status === 'succeeded') {
                        // Create Refund
                        const refund = await stripe.refunds.create({
                            payment_intent: paymentId,
                            reason: 'requested_by_customer',
                            metadata: {
                                wp_order_id: id,
                                reason: 'customer_cancel_api'
                            }
                        });
                        refundId = refund.id;
                        refundStatus = "refunded";
                    } else if (pi.status === 'requires_capture') {
                        // Cancel Authorization
                        await stripe.paymentIntents.cancel(paymentId);
                        refundStatus = "cancelled_auth";
                    }
                } else if (paymentId.startsWith('ch_')) {
                    // Legacy Charge (unlikely with PI but supported)
                    const refund = await stripe.refunds.create({
                        charge: paymentId,
                        metadata: { wp_order_id: id }
                    });
                    refundId = refund.id;
                    refundStatus = "refunded";
                }
            }
        } catch (stripeError: any) {
            console.error("Stripe refund error:", stripeError);
            // We might choose to proceed with WC cancellation even if Stripe fails, 
            // OR return error. Proceeding is safer for user UX (order stops), 
            // but risky for merchant (money not returned).
            // Let's return error to force manual intervention/retry mostly.
            return NextResponse.json({
                success: false,
                message: "Failed to process refund. Please contact support.",
                error: stripeError.message
            }, { status: 500 });
        }

        // 5. Update WooCommerce Order Status
        const updateResponse = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'cancelled',
                meta_data: [
                    { key: 'cancellation_reason', value: 'Customer requested cancellation via Website' },
                    { key: 'stripe_refund_id', value: refundId || 'none' },
                    { key: 'stripe_refund_status', value: refundStatus }
                ]
            }),
            cache: 'no-store'
        });

        if (!updateResponse.ok) {
            return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
        }

        const updatedOrder = await updateResponse.json();

        return NextResponse.json({
            success: true,
            message: "Order cancelled successfully",
            orderId: id,
            newStatus: updatedOrder.status,
            refundStatus
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error cancelling order:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}