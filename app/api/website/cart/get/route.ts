import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import cartLib from "../../../../../lib/cart";
import {
  calculateSimpleProductPrice,
  calculateVariableProductPrice,
} from "../../../../../lib/priceCalculatorForCart";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

export async function GET(req: NextRequest) {
  let session: any = await getServerSession(authOptions);

  // if (!session) {
  //   session = {
  //     user: {
  //       wpCustomerId: 123,
  //       email: "hadesgupta@gmail.com",
  //     }
  //   }
  // }

  let cart = null;
  let isGuest = false;

  // 1. Fetch Cart (DB or Cookie)
  if (session?.user?.wpCustomerId) {
    const wpCustomerId = Number(session.user.wpCustomerId);
    cart = await cartLib.getCartForCustomer(wpCustomerId);
  }

  if (!cart) {
    const cookie = req.cookies.get("guest_cart_order")?.value;
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        cart = parsed;
        isGuest = true;
      } catch { }
    }
  }

  if (!cart) {
    return NextResponse.json({
      ok: true,
      cart: { products: [] },
    });
  }

  // Initialize arrays if missing
  if (!Array.isArray(cart.products)) cart.products = [];

  // 2. Refreshed Cart Data Holder
  const refreshedCart = {
    products: [] as any[],
  };

  // Track price updates
  const priceUpdates: any[] = [];

  // Helper to process a single item
  const processItem = async (item: any) => {
    try {
      const response = await fetch(
        `${NEXTAUTH_URL}/api/website/products/${item.product_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const apiResponse = await response.json();


      // Extract product from the new API response structure
      if (!apiResponse.success || !apiResponse.product) {
        console.log('Product not found or invalid response for', item.product_id);
        return null;
      }

      const productResponse = apiResponse.product;

      let price: any = 0;
      let selectedVariation: any = null;
      let name = productResponse.name;
      let description = productResponse.description || "";
      let stock_status = "instock";
      let productQuantity = null;

      if (productResponse.type === "simple") {
        stock_status = productResponse.stock_status;
        productQuantity = productResponse.stock_quantity;

        // Only calculate price if in stock
        if (productResponse.stock_status === "instock") {
          price = calculateSimpleProductPrice(productResponse, item.quantity);
        }
      } else if (productResponse.type === "variable") {
        let variationId =
          item.variation_id || productResponse.variation_options?.[0]?.id;
        const variation = productResponse.variation_options?.find(
          (v: any) => v.id === Number(variationId)
        );

        if (!variation) return null;

        selectedVariation = variation;
        stock_status = variation.stock_status;
        productQuantity = variation.stock_quantity;

        // Only calculate price if in stock
        if (variation.stock_status === "instock") {
          price = calculateVariableProductPrice(variation, item.quantity);
        }
      } else {
        // Block other types (subscriptions) by returning null
        return null;
      }

      // Check if price has changed
      const oldPrice = item.price || 0;
      const newPrice = price || 0;

      if (oldPrice !== newPrice && newPrice > 0) {
        priceUpdates.push({
          product_id: item.product_id,
          variation_id: item.variation_id,
          name,
          oldPrice,
          newPrice,
          priceIncreased: newPrice > oldPrice,
        });
      }

      return {
        ...item,
        name,
        description,
        price,
        stock_status,
        productQuantity,
        attributes: selectedVariation?.attributes || [],
      };
    } catch (error) {
      console.error(`Error processing cart item ${item.product_id}:`, error);
      return null;
    }
  };

  // 3. Process All Items
  const productPromises = cart.products.map((item: any) => processItem(item));
  const processedProducts = await Promise.all(productPromises);
  refreshedCart.products = processedProducts.filter((p) => p !== null);

  // 4. Save Updates (Persist refreshed data)
  if (session?.user?.wpCustomerId && !isGuest) {
    const wpCustomerId = Number(session.user.wpCustomerId);
    await cartLib.setCartForCustomer(wpCustomerId, refreshedCart);
  }

  // Prepare response
  const response = NextResponse.json({
    ok: true,
    cart: refreshedCart,
    priceUpdates: priceUpdates.length > 0 ? priceUpdates : undefined,
    message: priceUpdates.length > 0
      ? `Price updated for ${priceUpdates.length} product${priceUpdates.length > 1 ? 's' : ''}`
      : undefined,
    storeInSession: !!session?.user?.wpCustomerId && !isGuest,
  });

  // If user is logged in, store the cart in a cookie named loggin_user_cart
  if (session?.user?.wpCustomerId && !isGuest) {
    response.cookies.set("logged_in_user_cart", JSON.stringify(refreshedCart), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  // If it was a guest cart (or we fell back to it), update the cookie
  if (
    isGuest ||
    (!session?.user?.wpCustomerId && refreshedCart.products.length > 0)
  ) {
    response.cookies.set("guest_cart_order", JSON.stringify(refreshedCart), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
