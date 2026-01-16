import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import cartLib from "../../../../../lib/cart";

// app/api/website/cart/clear/route.ts
export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  const body = await req.json().catch(() => ({}));
  const { action, product_id, variation_id } = body;
  
  const emptyCart = { products: [] };

  // 1) CLEAR ENTIRE CART
  if (action === "clear") {
    // logged-in
    if (session?.user?.wpCustomerId) {
      const wpCustomerId = Number(session.user.wpCustomerId);
      await cartLib.setCartForCustomer(wpCustomerId, emptyCart);
      const res = NextResponse.json({ ok: true, cart: emptyCart });
      res.cookies.set("loggin_user_cart", JSON.stringify(emptyCart), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });
      return res;
    }

    // guest (cookie)
    const res = NextResponse.json({ ok: true, cart: emptyCart });
    res.cookies.set("guest_cart_order", JSON.stringify(emptyCart), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  // 🔹 2) REMOVE SINGLE ITEM
  if (!product_id) {
    return NextResponse.json(
      { ok: false, error: "product_id required" },
      { status: 400 }
    );
  }

  const pId = Number(product_id);
  const vId = variation_id ? Number(variation_id) : undefined;

  const sameItem = (item: any) => {
    const sameProduct = item.product_id === pId;
    const sameVariation = vId ? item.variation_id === vId : !item.variation_id;
    return sameProduct && sameVariation;
  };

  const removeItemFromCart = (cart: any) => {
    // Ensure arrays exist
    const products = Array.isArray(cart.products) ? cart.products : [];

    // Filter out the matching item
    return {
      products: products.filter((i: any) => !sameItem(i)),
    };
  };

  /* ---------------- LOGGED-IN REMOVE ---------------- */
  if (session?.user?.wpCustomerId) {
    const wpCustomerId = Number(session.user.wpCustomerId);
    const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || emptyCart;

    const newCart = removeItemFromCart(cart);

    await cartLib.setCartForCustomer(wpCustomerId, newCart);
    const res = NextResponse.json({ ok: true, cart: newCart });
    res.cookies.set("loggin_user_cart", JSON.stringify(newCart), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  /* ---------------- GUEST REMOVE ---------------- */
  const cookies = req.cookies;
  const guestRaw = cookies.get("guest_cart_order")?.value;
  let guestCart = guestRaw ? JSON.parse(guestRaw) : emptyCart;

  const newGuestCart = removeItemFromCart(guestCart);

  const res = NextResponse.json({ ok: true, cart: newGuestCart });
  res.cookies.set("guest_cart_order", JSON.stringify(newGuestCart), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
