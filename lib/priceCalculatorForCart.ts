export interface Price {
    final_price: number;
    sale_price: number;
    regular_price: number;
    price_type: string;
    product_subtotal: number;
}

const buildPriceObject = (basePrice: number, salePrice: number, regularPrice: number, quantity: number): Price => {
    return {
        final_price: basePrice,
        sale_price: salePrice,
        regular_price: regularPrice,
        price_type: "regular",
        product_subtotal: basePrice * quantity,
    };
};

export const calculateSimpleProductPrice = (product: any, quantity: number): Price => {
    const base = Number(product.price);
    const sale = Number(product.sale_price || 0);
    const regular = Number(product.regular_price);

    const price = buildPriceObject(base, sale, regular, quantity);

    if (product.on_sale && sale > 0) {
        price.price_type = "sale";
        price.final_price = sale;
    }

    price.product_subtotal = price.final_price * quantity;
    return price;
};

export const calculateVariableProductPrice = (variation: any, quantity: number): Price => {
    const base = Number(variation.price);
    const sale = Number(variation.sale_price || 0);
    const regular = Number(variation.regular_price);

    const price = buildPriceObject(base, sale, regular, quantity);

    if (sale > 0) {
        price.price_type = "sale";
        price.final_price = sale;
    }

    price.product_subtotal = price.final_price * quantity;
    return price;
};

export const calculateSimpleSubscriptionProductPrice = (
    product: any,
    quantity: number
): { price: number; quantity: number; product_subtotal: number } => {
    return {
        price: Number(product.subscription_details?.sign_up_fee || 0),
        quantity,
        product_subtotal: Number(product.subscription_details?.sign_up_fee || 0) * quantity,
    };
};

export const calculateVariableSubscriptionProductPrice = (
    variation: any,
    quantity: number
): { price: number; quantity: number; product_subtotal: number } => {
    return {
        price: Number(variation.subscription_details?.sign_up_fee || 0),
        quantity,
        product_subtotal: Number(variation.subscription_details?.sign_up_fee || 0) * quantity,
    };
};
