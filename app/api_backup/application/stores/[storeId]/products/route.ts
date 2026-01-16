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
        const { searchParams } = new URL(request.url);

        // Build query string from search params
        const queryString = new URLSearchParams();
        searchParams.forEach((value, key) => {
            queryString.append(key, value);
        });

        // 🔐 Authenticate using shared NEXTAUTH_SECRET
        const url = `${WP_URL}/wp-json/wm/v1/stores/${storeId}/products${queryString.toString() ? `?${queryString.toString()}` : ''}`;

        const res = await fetch(url, {
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
                { error: "Failed to fetch store products", details: text },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("❌ Store Products API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
