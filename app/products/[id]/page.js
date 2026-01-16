// app/.../product/[id]/page.jsx
import React from "react";
import { redirect } from "next/navigation";
import { fetchProductById } from "../../../lib/woocommerce";
import TopNavigation from "./_components/TopNavigation/TopNavigation";
import ProductMain from "./_components/ProductMain/ProductMain";
import VideoSection from "./_components/Landing/VideoSection";
import Crafting from "./_components/Crafting/Crafting";
import Recommendation from "./_components/Recommendation/Recommendation";
import BrewingEquipment from "./_components/BrewingEquipment/BrewingEquipment";
import StickyBar from "./_components/StickyBar/StickyBar";
import BannerSection from "./_components/BannerSection/BannerSection";

import { ProductImageProvider } from "./_context/ProductImageContext";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  let product = null;
  try {
    product = await fetchProductById(id);
  } catch (err) {
    console.error("Error fetching product:", err);
    return (
      <main style={{ padding: "1rem" }}>
        <h1>Product not found</h1>
        <p>There was a problem loading this product. Please try again later.</p>
      </main>
    );
  }

  console.log("product", product);

  // Validate product type - only allow grouped products
  if (!product || product.type !== "grouped") {
    console.error("Invalid product type");
    redirect("/shop/coffee-beans");
  }

  if (product.status !== "publish") {
    redirect("/shop/coffee-beans");
  }

  if (Object.keys(product).length <= 0) {
    redirect("/shop/coffee-beans");
  }

  // ---------- NEW: fetch grouped children (simple + subscription etc.) ----------
  let groupedChildren = [];

  if (
    product &&
    product.type === "grouped" &&
    Array.isArray(product.grouped_products) &&
    product.grouped_products.length > 0
  ) {
    const childPromises = product.grouped_products.map((childId) =>
      fetchProductById(childId).catch((err) => {
        return null;
      })
    );

    const resolvedChildren = await Promise.all(childPromises);
    groupedChildren = resolvedChildren.filter(Boolean);
  }
  // -----------------------------------------------------------------------------


  // ---- Recommended products logic stays the same ----
  const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];
  let raw = null;
  for (const m of meta) {
    if (
      m &&
      (m.key === "_product_recommendations" ||
        m.key === "product_recommendations")
    ) {
      raw = m.value;
      break;
    }
  }

  let recommendedIds = [];
  try {
    if (Array.isArray(raw)) recommendedIds = raw;
    else if (typeof raw === "string" && raw.trim())
      recommendedIds = JSON.parse(raw);
    else if (typeof raw === "number") recommendedIds = [raw];
  } catch (e) {
    console.warn("Failed to parse recommended ids", e);
  }

  recommendedIds = (recommendedIds || [])
    .map((n) => Number(n))
    .filter(Boolean)
    .slice(0, 3);

  let recommendedProducts = [];
  if (recommendedIds.length) {
    const proms = recommendedIds.map((rid) =>
      fetchProductById(rid).catch((err) => {
        console.warn("Failed fetching recommended product", rid, err);
        return null;
      })
    );
    const resolved = await Promise.all(proms);
    recommendedProducts = resolved.filter(Boolean);
  }

  const getMetaValue = (metaData, key) =>
    metaData?.find(item => item.key === key)?.value ?? null;

  const videoSection = {
    title: getMetaValue(product.meta_data, "video_banner_title"),
    description: getMetaValue(product.meta_data, "video_banner_description"),
    videoId: getMetaValue(product.meta_data, "banner_video"),
  };

  const imageBanner = {
    title: getMetaValue(product.meta_data, "image_banner_title"),
    description: getMetaValue(product.meta_data, "image_banner_description"),
    imageId: getMetaValue(product.meta_data, "banner_image"),
  };

  const nestedGroups = product.meta_data.find(
    item => item.key === "_cg_main_section_data"
  )?.value ?? [];

  return (
    <div>
      <ProductImageProvider>
        <TopNavigation />
        <ProductMain product={product} variationOptions={product.variation_options} />
        <VideoSection product={videoSection} />
        <Crafting product={nestedGroups} />
        <BannerSection product={imageBanner} />
        {/* <Recommendation recommendedProducts={recommendedProducts} /> */}
        {/* <BrewingEquipment /> */}
        <StickyBar groupedChildren={groupedChildren} product={product} />
      </ProductImageProvider>
    </div>
  );
}
