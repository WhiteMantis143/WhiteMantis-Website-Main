import { NextResponse } from "next/server";

const WP_URL = process.env.WP_URL;

export async function GET() {
    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        const response = await fetch(`${WP_URL}/wp-json/wc/v3/coupons?per_page=100`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { success: false, message: "Failed to fetch coupons", error: errorData },
                { status: response.status }
            );
        }

        const coupons = await response.json();

        // Filter coupons based on metadata
        const visibleWebsiteCoupons = coupons.filter((coupon: any) => {
            const meta = coupon.meta_data || [];

            // Helper to find meta value
            const getMetaValue = (key: string) => {
                const item = meta.find((m: any) => m.key === key);
                return item ? item.value : null;
            };

            const visibility = getMetaValue("coupon_visibility");
            const couponFor = getMetaValue("coupan_for");

            return (
                visibility === "show" &&
                (couponFor === "website" || couponFor === "both")
            );
        });

        return NextResponse.json({
            success: true,
            coupons: visibleWebsiteCoupons
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
