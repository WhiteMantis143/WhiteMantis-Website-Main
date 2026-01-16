import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import cartLib from "../../../../../lib/cart";
import { calculateSimpleProductPrice, calculateVariableProductPrice } from "../../../../../lib/priceCalculatorForCart";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

export async function POST(req: NextRequest) {
    const session: any = await getServerSession(authOptions);

    // if (!session) {
    //     session = {
    //         user: {
    //             wpCustomerId: 123,
    //             email: "hadesgupta@gmail.com",
    //         }
    //     }
    // }

    const body = await req.json().catch(() => ({}));
    let { product_id, variation_id, quantity = 1, description, image, name } = body;
    let selectedVariation = null;
    let price = null;
    let productResponse = null;

    product_id = Number(product_id);
    quantity = Number(quantity);

    if (!product_id || !quantity) {
        return NextResponse.json({ success: false, message: "product_id required" }, { status: 400 });
    }

    try {
        const response = await fetch(`${NEXTAUTH_URL}/api/website/products/${product_id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const apiResponse = await response.json();

        // Extract product from the new API response structure
        if (!apiResponse.success || !apiResponse.product) {
            return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        productResponse = apiResponse.product;
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }

    // ❌ BLOCK SUBSCRIPTIONS
    if (productResponse.type === "subscription" || productResponse.type === "variable-subscription") {
        return NextResponse.json(
            { success: false, message: "Cannot add subscription products to cart" },
            { status: 400 }
        );
    }

    // SIMPLE PRODUCT
    if (productResponse.type === "simple") {
        if (productResponse.stock_status === "outofstock") {
            return NextResponse.json({ success: false, message: "Product is out of stock" }, { status: 400 });
        }

        // Check if requested quantity exceeds available stock
        const stockQuantity = productResponse.stock_quantity;
        if (stockQuantity !== null && stockQuantity !== undefined && quantity > stockQuantity) {
            return NextResponse.json({
                success: false,
                message: `Only ${stockQuantity} units available in stock`
            }, { status: 400 });
        }

        price = calculateSimpleProductPrice(productResponse, quantity);
    }

    // VARIABLE PRODUCT
    else if (productResponse.type === "variable") {
        if (!variation_id) {
            variation_id = productResponse.variation_options[0]?.id;
        }

        const variation = productResponse.variation_options.find((v: any) => v.id === Number(variation_id));

        if (!variation) {
            return NextResponse.json({ success: false, message: "variation_id not found" }, { status: 400 });
        }

        if (variation.stock_status === "outofstock") {
            return NextResponse.json({ success: false, message: "Product is out of stock" }, { status: 400 });
        }

        // Check if requested quantity exceeds available stock
        const stockQuantity = variation.stock_quantity;
        if (stockQuantity !== null && stockQuantity !== undefined && quantity > stockQuantity) {
            return NextResponse.json({
                success: false,
                message: `Only ${stockQuantity} units available in stock`
            }, { status: 400 });
        }

        selectedVariation = variation;

        // Prioritize variation image if available
        if (selectedVariation?.image) {
            const vImg = selectedVariation.image;
            image = typeof vImg === 'string' ? vImg : vImg.src;
        }

        price = calculateVariableProductPrice(variation, quantity);
    }

    // 🛒 LOGGED IN USER CART
    if (session?.user?.wpCustomerId) {
        const wpCustomerId = Number(session.user.wpCustomerId);
        const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || { products: [] };

        if (!Array.isArray(cart.products)) cart.products = [];

        const pId = product_id;
        const vId = variation_id ? Number(variation_id) : undefined;

        const existingIndex = cart.products.findIndex(
            (item: any) => item.product_id === pId && item.variation_id === vId
        );

        if (existingIndex > -1) {
            // Check if total quantity would exceed stock
            const currentQuantity = cart.products[existingIndex].quantity;
            const totalQuantity = currentQuantity + quantity;
            const stockQuantity = selectedVariation?.stock_quantity || productResponse.stock_quantity;

            if (stockQuantity !== null && stockQuantity !== undefined && totalQuantity > stockQuantity) {
                return NextResponse.json({
                    ok: false,
                    error: `Cannot add ${quantity} more. Only ${stockQuantity} units available (${currentQuantity} already in cart)`
                }, { status: 400 });
            }

            cart.products[existingIndex].quantity += quantity;
        } else {
            cart.products.push({
                product_id: pId,
                variation_id: vId,
                quantity,
                productQuantity: selectedVariation?.stock_quantity,
                stock_status: selectedVariation?.stock_status,
                name: name,
                description: description || "",
                image: image,
                price,
                attributes: selectedVariation?.attributes || [],
            });
        }

        await cartLib.setCartForCustomer(wpCustomerId, cart);

        return NextResponse.json({ ok: true, cart });
    }

    // 👤 GUEST CART
    else {
        const guestCart = { products: [] as any[] };
        const cookie = req.cookies.get("guest_cart_order")?.value;

        if (cookie) {
            try {
                const parsed = JSON.parse(cookie);
                if (Array.isArray(parsed.products)) guestCart.products = parsed.products;
            } catch { }
        }

        const pId = product_id;
        const vId = variation_id ? Number(variation_id) : undefined;

        const existingIndex = guestCart.products.findIndex(
            (item: any) => item.product_id === pId && item.variation_id === vId
        );

        if (existingIndex > -1) {
            // Check if total quantity would exceed stock
            const currentQuantity = guestCart.products[existingIndex].quantity;
            const totalQuantity = currentQuantity + quantity;
            const stockQuantity = selectedVariation?.stock_quantity || productResponse.stock_quantity;

            if (stockQuantity !== null && stockQuantity !== undefined && totalQuantity > stockQuantity) {
                return NextResponse.json({
                    ok: false,
                    error: `Cannot add ${quantity} more. Only ${stockQuantity} units available (${currentQuantity} already in cart)`
                }, { status: 400 });
            }

            guestCart.products[existingIndex].quantity += quantity;
        } else {
            guestCart.products.push({
                product_id: pId,
                variation_id: vId,
                quantity,
                productQuantity: selectedVariation?.stock_quantity,
                stock_status: selectedVariation?.stock_status,
                name: name,
                description: description || "",
                image: image,
                price,
                attributes: selectedVariation?.attributes || [],
            });
        }

        const response = NextResponse.json({ ok: true, cart: guestCart });

        response.cookies.set("guest_cart_order", JSON.stringify(guestCart), {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    }
}
