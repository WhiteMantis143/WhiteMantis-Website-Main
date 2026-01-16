import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { WP_URL, NEXTAUTH_SECRET } = process.env;

        if (!WP_URL || !NEXTAUTH_SECRET) {
            return NextResponse.json(
                { error: "Server configuration missing" },
                { status: 500 }
            );
        }

        const { storeId } = await params;

        // 🔐 Authenticate using shared NEXTAUTH_SECRET
        const res = await fetch(`${WP_URL}/wp-json/wm/v1/stores/${storeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Secret': NEXTAUTH_SECRET,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json(
                { error: "Failed to fetch store details", details: text },
                { status: res.status }
            );
        }

        const store = await res.json();

        return NextResponse.json(store, { status: 200 });
    } catch (error) {
        console.error("❌ Store Details API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
