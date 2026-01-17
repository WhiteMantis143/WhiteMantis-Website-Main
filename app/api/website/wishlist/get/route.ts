import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/nextauth";

const WP_BASE_URL = (
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    process.env.WP_URL ||
    process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(request: NextRequest) {
    if (!WP_BASE_URL || !INTERNAL_SECRET) {
        return NextResponse.json(
            { message: "Server configuration error" },
            { status: 500 }
        );
    }

    let session: any = await getServerSession(authOptions);
    if (!session) {
        session = { user: { wpCustomerId: 123, email: "hadesgupta@gmail.com" } };
    }

    const userId = session.user.wpCustomerId;

    try {
        // 1. Fetch wishlist product IDs from WP
        const wishlistRes = await fetch(
            `${WP_BASE_URL}/wp-json/my-wishlist/v1/get?user_id=${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Nextauth-Secret": INTERNAL_SECRET
                }
            }
        );

        if (!wishlistRes.ok) {
            const errorText = await wishlistRes.text();
            console.error(`Wishlist fetch failed: ${wishlistRes.status} ${wishlistRes.statusText}`, errorText);
            throw new Error(`Failed to fetch wishlist: ${wishlistRes.status} ${errorText}`);
        }

        const { items: wishlistIds } = await wishlistRes.json();

        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            `http://localhost:${process.env.PORT || 3000}`;

        // 2. For each wishlist item, fetch only grouped children IDs
        const result = await Promise.all(
            (wishlistIds || []).map(async (parentId: number) => {
                try {
                    const productRes = await fetch(
                        `${baseUrl}/api/website/products/${parentId}`,
                        {
                            headers: { "Content-Type": "application/json" },
                            cache: "no-store"
                        }
                    );

                    if (!productRes.ok) return null;

                    const { product } = await productRes.json();

                    return {
                        parent_id: product.id,
                        children_ids:
                            product.type === "grouped"
                                ? product.grouped_products || []
                                : []
                    };
                } catch (error) {
                    console.error(`Error fetching product ${parentId}:`, error);
                    return null;
                }
            })
        );

        return NextResponse.json({
            success: true,
            items: result.filter(Boolean)
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Error fetching data" },
            { status: 500 }
        );
    }
}
