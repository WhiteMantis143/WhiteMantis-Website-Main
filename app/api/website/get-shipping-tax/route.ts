import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.WP_URL || process.env.WC_API_URL;

export async function GET(req: NextRequest) {
    try {
        const response = await fetch(`${WP_URL}/wp-json/custom/v1/flat-rates`, {
            headers: {
                'X-Custom-Secret': process.env.NEXTAUTH_SECRET,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ API Error:", errorData);
            return NextResponse.json({
                success: false,
                error: "Failed to fetch shipping tax",
                message: errorData.message || "API request failed"
            }, { status: response.status });
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
            return NextResponse.json({
                success: false,
                error: "Invalid response format"
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error("❌ Error fetching shipping tax:", error);
        return NextResponse.json({
            success: false,
            error: "Internal server error",
            message: error.message
        }, { status: 500 });
    }
}