const getProductGroups = (product) => {
  if (!product?.meta_data) {
    return { leftDetails: [], rightDetails: [] };
  }

  const metaItem = product.meta_data.find(
    (m) => m.key === "_product_groups" || m.key === "product_groups"
  );

  if (!metaItem || !metaItem.value) {
    return { leftDetails: [], rightDetails: [] };
  }

  let groups = [];

  // meta value can be a JSON string or already an array
  if (typeof metaItem.value === "string") {
    try {
      groups = JSON.parse(metaItem.value);
    } catch (e) {
      console.error("Failed to parse product_groups JSON", e);
      groups = [];
    }
  } else if (Array.isArray(metaItem.value)) {
    groups = metaItem.value;
  }

  const leftDetails = [];
  const rightDetails = [];

  groups.forEach((g, idx) => {
    const detail = {
      title: g.title || "",
      desc: g.description || "",
    };

    // alternate left / right, max 3 each
    if (idx % 2 === 0 && leftDetails.length < 3) {
      leftDetails.push(detail);
    } else if (rightDetails.length < 3) {
      rightDetails.push(detail);
    }
  });

  return { leftDetails, rightDetails };
};

export default getProductGroups;                    
