import { NextResponse } from "next/server";
import { filterProductResponse } from "../../../../../lib/productMapper";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
        }

        const authHeader =
            "Basic " +
            Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

        const WP_BASE = process.env.WP_URL;
        const res = await fetch(`${WP_BASE}/wp-json/wc/v3/products/${id}`, {
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
        });

        if (res.status === 404) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        if (!res.ok) {
            const errorData = await res.json();
            console.error("WooCommerce API error:", errorData);
            return NextResponse.json({ success: false, message: errorData.message || "Failed to fetch product" }, { status: res.status });
        }

        const product = await res.json();

        return NextResponse.json({ success: true, product: filterProductResponse(product) }, { status: 200 });

    } catch (error: any) {
        console.error("API /products/[id] error:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch product" },
            { status: 500 }
        );
    }
}
