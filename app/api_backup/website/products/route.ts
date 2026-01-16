import { NextResponse } from "next/server";
import { fetchProductsByCategory } from "../../../../lib/woo";

// Helper function to transform product data for frontend
function transformProductData(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    price: product.price,
    regular_price: product.regular_price,
    sale_price: product.sale_price,
    on_sale: product.on_sale,
    price_html: product.price_html,
    images: product.images,
    categories: product.categories,
  };
}

// Helper function to transform array of products
function transformProductsData(products: any[]) {
  return Array.isArray(products) ? products.map(transformProductData) : [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parent = Number(process.env.WEBSITE_PARENT_CATEGORY_ID);
    const per_page = Number(searchParams.get("per_page") || 12);
    const page = Number(searchParams.get("page") || 1);

    const products = await fetchProductsByCategory(parent, { per_page, page });

    // Transform products to only include essential fields
    const transformedProducts = transformProductsData(products);

    return NextResponse.json(transformedProducts, { status: 200 });
  } catch (error: any) {
    console.error("API /products error:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
