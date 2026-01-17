// getBrewingDataFromProduct.js
function getBrewingDataFromProduct(product) {
  if (!product || !Array.isArray(product.meta_data)) return {};

  const meta = product.meta_data;

  // --- helpers ---
  const getMetaValue = (key) => {
    const found = meta.find((m) => m.key === key);
    return found ? found.value : null;
  };

  const getImageUrlById = (imageId) => {
    if (!imageId || !Array.isArray(product.images)) return null;

    const idNum = Number(imageId);
    const match = product.images.find((img) => Number(img.id) === idNum);

    return match ? match.src || match.url || null : null;
  };

  const slugifyTitleToKey = (title, index) => {
    const lower = title.toLowerCase();

    // Keep special names working
    if (lower.includes("french")) return "french";
    if (lower.includes("pour")) return "pour";

    // Generic slug (e.g. "Cold Brew" -> "cold_brew")
    const base = lower
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return base || `method_${index + 1}`;
  };

  // --- section title + subtitle ---
  const sectionTitle = getMetaValue("_cg_section_title") || "";
  const sectionDescription = getMetaValue("_cg_section_description") || "";

  // --- nested groups ---
  let groups = getMetaValue("_cg_nested_groups") || [];

  if (!Array.isArray(groups) && typeof groups === "string") {
    try {
      groups = JSON.parse(groups);
    } catch (e) {
      groups = [];
    }
  }

  if (!Array.isArray(groups)) groups = [];

  const data = {};

  groups.forEach((group, index) => {
    if (!group || !group.title) return;

    const key = slugifyTitleToKey(group.title, index);
    const imageUrl = getImageUrlById(group.image_id);

    data[key] = {
      key, // internal key
      label: group.title, // for button text
      title: sectionTitle,
      subtitle: sectionDescription,
      image: imageUrl,
      steps: (group.items || []).map((item) => ({
        title: item.title,
        desc: item.description,
      })),
    };
  });

  return data;
}

export default getBrewingDataFromProduct;
