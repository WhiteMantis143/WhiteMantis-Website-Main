import { NextRequest, NextResponse } from "next/server";

const WP_URL = `${process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3/settings/general`;

export async function GET(req: NextRequest) {

    const authHeader =
        "Basic " +
        Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");
    try {
        const response = await fetch(WP_URL, {
            headers: {
                'Authorization': authHeader,
            },
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            console.error("WooCommerce API error:", response.status, response.statusText);
            return NextResponse.json({
                success: false,
                message: `Error fetching store address: ${response.statusText}`
            }, { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json({ success: true, data }, { status: 200 });
    }
    catch (error: any) {
        console.error("Error fetching store address:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching store address"
        }, { status: 500 });
    }
}