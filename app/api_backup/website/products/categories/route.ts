import { NextResponse } from "next/server";

function transformProductData(product: any) {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price || "",
        sale_price: product.sale_price || "",
        regular_price: product.regular_price || "",
        image: product.image || null,
        images: Array.isArray(product.images)
            ? product.images.filter(Boolean) // removes null/empty
            : [],
    };
}

function transformProductsData(products: any[]) {
    return Array.isArray(products) ? products.map(transformProductData) : [];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = Number(searchParams.get("parent_id") || process.env.WEBSITE_PARENT_CATEGORY_ID);
        const categoryIds = searchParams.get("categories");
        const sort = searchParams.get("sort") || "latest";

        const WP_BASE = process.env.WP_URL;

        // Fetch recursive categories tree
        if (!categoryIds) {
            const res = await fetch(`${WP_BASE}/wp-json/custom/v1/categories?parent=${parentId}`);

            if (res.status === 404) {
                return NextResponse.json(
                    { type: "categories", message: "Category not found" },
                    { status: 404 }
                );
            }

            const categories = await res.json();
            return NextResponse.json(
                { type: "categories", data: categories },
                { status: 200 }
            );
        }

        // Fetch products filtered by multiple categories + sorting
        const res = await fetch(`${WP_BASE}/wp-json/custom/v1/products?categories=${categoryIds}&sort=${sort}`);

        if (res.status === 404) {
            return NextResponse.json(
                { type: "products", message: "Category not found" },
                { status: 404 }
            );
        }

        const products = await res.json();
        const transformed = transformProductsData(products);

        return NextResponse.json(
            { type: "products", data: transformed },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json(
            { message: error?.message || "Failed to fetch data" },
            { status: 500 }
        );
    }
}
