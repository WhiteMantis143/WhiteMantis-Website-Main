
export function filterProductResponse(product: any) {
    if (!product) return null;

    // 1. Common Fields
    const base = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        tagline: getMetaValue(product.meta_data, 'tagline') || '',
        permalink: product.permalink,
        type: product.type,
        status: product.status,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        on_sale: product.on_sale,
        stock_status: product.stock_status,
        average_rating: product.average_rating,
        rating_count: product.rating_count,
        images: product.images?.map((img: any) => ({
            id: img.id,
            src: img.src,
            name: img.name,
            alt: img.alt,
        })) || [],
        categories: product.categories?.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
        })) || [],
        attributes: product.attributes || [],
        has_options: product.has_options,
        variations: product.variations || [],
        grouped_products: product.grouped_products || [],
        related_ids: product.related_ids || [],
        all_images: product.all_images || [],
        meta_data: processMetaData(product.meta_data) || {},
    };

    // 2. Type-Specific Logic

    // --- Subscription (Simple) ---
    if (product.type === 'subscription') {
        const subMeta = extractSubscriptionMeta(product.meta_data);
        return {
            ...base,
            subscription_details: subMeta,
        };
    }

    // --- Variable & Variable Subscription ---
    if (product.type === 'variable' || product.type === 'variable-subscription') {
        // If variation_options (hydrated variations) exists, map them
        let variationOptions = [];
        if (product.variation_options && Array.isArray(product.variation_options)) {
            variationOptions = product.variation_options.map((v: any) => {
                const vBase = {
                    id: v.id,
                    price: v.price,
                    regular_price: v.regular_price,
                    sale_price: v.sale_price,
                    price_type: v.price_type,
                    in_stock: v.in_stock,
                    stock_status: v.in_stock ? 'instock' : 'outofstock',
                    stock_quantity: v.stock_quantity,
                    attributes: v.attributes,
                    image: v.image,
                };

                // If it's a variable subscription, the variations contain the subscription terms
                if (product.type === 'variable-subscription') {
                    // Prefer any `subscription_details` provided directly on the variation (from Woo's variation_options),
                    // otherwise extract from meta_data when available
                    const vSubMeta = (v.subscription_details ? { ...v.subscription_details } : null) || extractSubscriptionMeta(v.meta_data) || {};
                    // If Woo provides a subscription_discount on the variation, include it in subscription_details
                    if (typeof v.subscription_discount !== 'undefined' && v.subscription_discount !== null) {
                        vSubMeta.subscription_discount = v.subscription_discount;
                    }

                    return {
                        ...vBase,
                        subscription_details: vSubMeta,
                    };
                }

                return vBase;
            });
        }

        return {
            ...base,
            variation_options: variationOptions,
        };
    }

    // --- Grouped ---
    if (product.type === 'grouped') {
        return {
            ...base,
        };
    }

    // --- Simple ---
    return base;
}

function processMetaData(metaData: any[]) {
    if (!Array.isArray(metaData)) return {};

    const ignoredKeys = new Set([
        '_subscription_price',
        '_subscription_sign_up_fee',
        '_subscription_period',
        '_subscription_period_interval',
        '_subscription_length',
        '_subscription_trial_period',
        '_subscription_trial_length',
    ]);

    const result: Record<string, any> = {};

    metaData.forEach((item: any) => {
        if (!item.key || ignoredKeys.has(item.key)) return;

        // Skip internal ACF field references (e.g. key: "_farm_description", value: "field_691d...")
        if (item.key.startsWith('_') && typeof item.value === 'string' && item.value.startsWith('field_')) {
            return;
        }

        let value = item.value;

        // Auto-parse JSON strings for specific keys or if they look like JSON
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{')) &&
            (item.key === '_product_groups' || item.key === '_product_recommendations' || item.key === '_cg_nested_groups' || item.key === '_min_max_variation_data')) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                // keep original string if parse fails
            }
        }

        result[item.key] = value;
    });

    return result;
}

function extractSubscriptionMeta(metaData: any) {
    if (!metaData) return null;

    // If metaData is an array (raw WP response), use helper to find keys
    if (Array.isArray(metaData)) {
        return {
            price: getMetaValue(metaData, '_subscription_price'),
            sign_up_fee: getMetaValue(metaData, '_subscription_sign_up_fee'),
            period: getMetaValue(metaData, '_subscription_period'),
            period_interval: getMetaValue(metaData, '_subscription_period_interval'),
            length: getMetaValue(metaData, '_subscription_length'),
            trial_period: getMetaValue(metaData, '_subscription_trial_period'),
            trial_length: getMetaValue(metaData, '_subscription_trial_length'),
            subscription_discount: getMetaValue(metaData, '_subscription_discount'),
        };
    }

    // If metaData is already a processed object, read properties directly
    if (typeof metaData === 'object') {
        return {
            price: metaData._subscription_price ?? metaData['_subscription_price'] ?? metaData.subscription_price ?? null,
            sign_up_fee: metaData._subscription_sign_up_fee ?? metaData['_subscription_sign_up_fee'] ?? metaData.subscription_sign_up_fee ?? null,
            period: metaData._subscription_period ?? metaData['_subscription_period'] ?? metaData.subscription_period ?? null,
            period_interval: metaData._subscription_period_interval ?? metaData['_subscription_period_interval'] ?? metaData.subscription_period_interval ?? null,
            length: metaData._subscription_length ?? metaData['_subscription_length'] ?? metaData.subscription_length ?? null,
            trial_period: metaData._subscription_trial_period ?? metaData['_subscription_trial_period'] ?? metaData.subscription_trial_period ?? null,
            trial_length: metaData._subscription_trial_length ?? metaData['_subscription_trial_length'] ?? metaData.subscription_trial_length ?? null,
            subscription_discount: metaData._subscription_discount ?? metaData['_subscription_discount'] ?? metaData.subscription_discount ?? null,
        };
    }

    return null;
}

function getMetaValue(metaData: any[], key: string) {
    const item = metaData.find((m: any) => m.key === key);
    return item ? item.value : null;
}
