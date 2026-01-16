import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";

const WP_URL = process.env.WP_URL;

export async function GET(request: NextRequest) {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.email) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    const userId = session.user.wpCustomerId || session.user.id;

    if (!userId) {
        return NextResponse.json({ success: false, message: "User ID not found" }, { status: 400 });
    }

    console.log(`🔍 Checking account deletion eligibility for user ID: ${userId}`);

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        // Fetch all orders and active subscriptions in parallel using Promise.all
        const [ordersResponse, subscriptionsResponse] = await Promise.all([
            // Fetch all orders (we'll filter by metadata later)
            fetch(`${WP_URL}/wp-json/wc/v3/orders?customer=${userId}&per_page=100`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            }),
            // Fetch only active subscriptions
            fetch(`${WP_URL}/wp-json/wc/v3/subscriptions?customer=${userId}&status=active&per_page=100`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            })
        ]);

        // Check if both requests were successful
        if (!ordersResponse.ok) {
            const errorData = await ordersResponse.json().catch(() => ({}));
            console.error("Failed to fetch orders:", errorData);
            return NextResponse.json(
                { success: false, message: "Failed to fetch orders" },
                { status: ordersResponse.status }
            );
        }

        if (!subscriptionsResponse.ok) {
            const errorData = await subscriptionsResponse.json().catch(() => ({}));
            console.error("Failed to fetch subscriptions:", errorData);
            return NextResponse.json(
                { success: false, message: "Failed to fetch subscriptions" },
                { status: subscriptionsResponse.status }
            );
        }

        // Parse responses
        const allOrders = await ordersResponse.json();
        const subscriptions = await subscriptionsResponse.json();

        console.log(`📦 Found ${allOrders.length} total orders`);
        console.log(`📋 Found ${subscriptions.length} active subscriptions`);

        // Filter orders to only include those with delivery_status = "orderPlaced"
        const ordersWithPlacedStatus = allOrders.filter((order: any) => {
            const meta = order.meta_data || [];
            const deliveryStatusMeta = meta.find((m: any) => m.key === "delivery_status");
            return deliveryStatusMeta?.value === "orderPlaced";
        });

        console.log(`✅ Found ${ordersWithPlacedStatus.length} orders with 'orderPlaced' status`);

        // Extract IDs
        const activeOrderIds = ordersWithPlacedStatus.map((order: any) => order.id);
        const activeSubscriptionIds = subscriptions.map((sub: any) => sub.id);

        // Return the IDs
        return NextResponse.json({
            success: true,
            activeOrders: {
                count: activeOrderIds.length,
                ids: activeOrderIds,
            },
            activeSubscriptions: {
                count: activeSubscriptionIds.length,
                ids: activeSubscriptionIds,
            },
        });

    } catch (error: any) {
        console.error("Profile delete check error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to check account status", error: error.message },
            { status: 500 }
        );
    }
}