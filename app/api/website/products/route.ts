import { NextResponse } from "next/server";
import { fetchProductsByCategory, fetchProductById } from "../../../../lib/woo";
import { filterProductResponse } from "../../../../lib/productMapper";

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

    const category_id = searchParams.get("category_id");
    const per_page = Number(searchParams.get("per_page") || 12);
    const page = Number(searchParams.get("page") || 1);

    if (category_id) {
      // 1. Fetch products for the specific category
      const products = await fetchProductsByCategory(category_id, { per_page, page });

      // 2. Filter for grouped products only
      const groupedProducts = Array.isArray(products)
        ? products.filter((p: any) => p.type === 'grouped')
        : [];

      // 3. Enhance grouped products with full child data
      const enhancedProducts = await Promise.all(
        groupedProducts.map(async (parent: any) => {
          const childrenMap: Record<string, any> = {};

          if (parent.grouped_products && parent.grouped_products.length > 0) {
            await Promise.all(
              parent.grouped_products.map(async (childId: number) => {
                try {
                  const child = await fetchProductById(childId);
                  if (child) {
                    // Use the mapper to ensure variation_options or subscription_details are present
                    childrenMap[child.id] = filterProductResponse(child);
                  }
                } catch (e) {
                  console.error(`Failed to fetch child ${childId} for parent ${parent.id}`, e);
                }
              })
            );
          }

          // Extract tasting_notes_description from meta_data
          const metaData = parent.meta_data || [];
          const tastingNotes = metaData.find((m: any) => m.key === 'tasting_notes_description' || m.key === 'tasting_notes')?.value || "";

          return {
            id: parent.id,
            name: parent.name,
            slug: parent.slug,
            categories: parent.categories,
            tasting_notes_description: tastingNotes,
            children: childrenMap
          };
        })
      );

      return NextResponse.json(enhancedProducts, { status: 200 });

    } else {
      // Existing default behavior
      const parent = Number(process.env.WEBSITE_PARENT_CATEGORY_ID);
      const products = await fetchProductsByCategory(parent, { per_page, page });

      // Transform products to only include essential fields
      const transformedProducts = transformProductsData(products);

      return NextResponse.json(transformedProducts, { status: 200 });
    }

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
