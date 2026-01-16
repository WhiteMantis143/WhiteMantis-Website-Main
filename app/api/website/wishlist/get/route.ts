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
        return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    let session: any = await getServerSession(authOptions);
    if (!session) {
        session = { user: { wpCustomerId: 123, email: "hadesgupta@gmail.com" } };
    }

    const userId = session.user.wpCustomerId;

    try {
        // 1. Fetch Wishlist IDs
        const wishlistRes = await fetch(`${WP_BASE_URL}/wp-json/my-wishlist/v1/get?user_id=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Nextauth-Secret": INTERNAL_SECRET
            }
        });

        if (!wishlistRes.ok) throw new Error("Failed to fetch wishlist");
        const { items: wishlistIds } = await wishlistRes.json();

        // 2. Fetch Parent Products using internal Next.js API route
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

        const fullWishlistData = await Promise.all(
            (wishlistIds || []).map(async (productId: number) => {
                try {
                    // Use internal Next.js API route for consistent product filtering
                    const productRes = await fetch(`${baseUrl}/api/website/products/${productId}`, {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        cache: "no-store"
                    });

                    if (!productRes.ok) return null;
                    const { product: parent } = await productRes.json();

                    // 3. Fetch Full Data for every child in grouped_products
                    let fullChildrenData = [];
                    if (parent.type === "grouped" && parent.grouped_products?.length > 0) {
                        fullChildrenData = await Promise.all(
                            parent.grouped_products.map(async (childId: number) => {
                                try {
                                    const childRes = await fetch(`${baseUrl}/api/website/products/${childId}`, {
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        cache: "no-store"
                                    });
                                    if (!childRes.ok) return null;
                                    const childData = await childRes.json();
                                    // Return all data from the child product response
                                    return childData.product;
                                } catch (error) {
                                    console.error(`Error fetching child product ${childId}:`, error);
                                    return null;
                                }
                            })
                        );
                    }

                    // 4. Combine Parent info with Full Child Data
                    return {
                        parentId: parent.id,
                        parentName: parent.name,
                        parentDescription: parent.description,
                        parentSlug: parent.slug,
                        children: fullChildrenData.filter(Boolean)
                    };
                } catch (error) {
                    console.error(`Error fetching product ${productId}:`, error);
                    return null;
                }
            })
        );

        // Transform the data to match frontend expectations
        const transformedItems = fullWishlistData
            .filter(Boolean)
            .map((item) => {
                // For grouped products, use parent info with first child's price
                if (item.children && item.children.length > 0) {
                    const firstChild = item.children[0];
                    return {
                        id: item.parentId,
                        name: item.parentName,
                        description: item.parentDescription,
                        image: item.parentImages?.[0] || null,
                        all_images: item.parentImages || [],
                        slug: item.parentSlug,
                        price: firstChild.price,
                        regular_price: firstChild.regular_price,
                        sale_price: firstChild.sale_price,
                        simple_child_id: firstChild.id,
                        type: 'grouped',
                        children: item.children
                    };
                }

                // For simple products, return as-is
                return {
                    id: item.parentId,
                    name: item.parentName,
                    description: item.parentDescription,
                    image: item.parentImages?.[0] || null,
                    all_images: item.parentImages || [],
                    slug: item.parentSlug,
                    type: 'simple'
                };
            });

        return NextResponse.json({
            success: true,
            items: transformedItems
        });

    } catch (error) {
        return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
    }
}