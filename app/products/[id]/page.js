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

/* ---------------- SLUG HELPER (OPTIONAL) ---------------- */
const slugify = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default async function ProductDetailPage({ params }) {
  /**
   * params.id = "ethiopia-guji-light-roast-134"
   * Extract ID from the last hyphen
   */
  const { id: slugWithId } = await params;
  const id = slugWithId?.split("-").pop();

  if (!id) {
    redirect("/shop/coffee-beans");
  }

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

  // ---------- VALIDATIONS ----------
  if (!product || product.type !== "grouped") {
    redirect("/shop/coffee-beans");
  }

  if (product.status !== "publish") {
    redirect("/shop/coffee-beans");
  }

  if (Object.keys(product).length === 0) {
    redirect("/shop/coffee-beans");
  }

  // ---------- CANONICAL URL CHECK (SEO) ----------
  const canonicalSlug = product.tagline
    ? `${slugify(`${product.name}-${product.tagline}`)}-${product.id}`
    : `${slugify(product.name)}-${product.id}`;

  if (slugWithId !== canonicalSlug) {
    redirect(`/products/${canonicalSlug}`);
  }

  // ---------- FETCH GROUPED CHILD PRODUCTS ----------
  let groupedChildren = [];

  if (
    product.type === "grouped" &&
    Array.isArray(product.grouped_products) &&
    product.grouped_products.length > 0
  ) {
    const childPromises = product.grouped_products.map((childId) =>
      fetchProductById(childId).catch(() => null)
    );

    const resolvedChildren = await Promise.all(childPromises);
    groupedChildren = resolvedChildren.filter(Boolean);
  }

  // ---------- RECOMMENDED PRODUCTS ----------
  const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];

  let raw = null;
  for (const m of meta) {
    if (
      m?.key === "_product_recommendations" ||
      m?.key === "product_recommendations"
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

  recommendedIds = recommendedIds
    .map((n) => Number(n))
    .filter(Boolean)
    .slice(0, 3);

  let recommendedProducts = [];
  if (recommendedIds.length) {
    const proms = recommendedIds.map((rid) =>
      fetchProductById(rid).catch(() => null)
    );
    const resolved = await Promise.all(proms);
    recommendedProducts = resolved.filter(Boolean);
  }

  // ---------- META HELPERS ----------
  const getMetaValue = (metaData, key) =>
    metaData?.find((item) => item.key === key)?.value ?? null;

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

  const nestedGroups =
    product.meta_data.find(
      (item) => item.key === "_cg_main_section_data"
    )?.value ?? [];

  // ---------- RENDER ----------
  return (
    <div>
      <ProductImageProvider>
        <TopNavigation />
        <ProductMain
          product={product}
          variationOptions={product.variation_options}
        />
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
