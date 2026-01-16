import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import cartLib from "../../../../../lib/cart";

async function getSession() {
  try {
    const session = (await getServerSession(authOptions)) as any;
    return session;
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.wpCustomerId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const wpCustomerId = Number(session.user.wpCustomerId);
  const cookies = req.cookies;
  const guestRaw = cookies.get("guest_cart_order")?.value;

  // If there's no guest cookie, just return the existing server cart
  if (!guestRaw) {
    try {
      const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || { products: [] };
      return NextResponse.json({ ok: true, cart });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
    }
  }

  let guestCart: any = { products: [] };
  try {
    guestCart = JSON.parse(guestRaw) || { products: [] };
  } catch (e) {
    // malformed cookie — treat as empty
    guestCart = { products: [] };
  }

  try {
    const serverCart = (await cartLib.getCartForCustomer(wpCustomerId)) || { products: [] };
    const mergedMap: any = {};

    const pushItem = (it: any) => {
      const pid = Number(it.product_id);
      const vid = it.variation_id ? Number(it.variation_id) : undefined;
      const key = `${pid}:${vid || 0}`;
      if (!mergedMap[key]) {
        // clone to avoid mutating source
        mergedMap[key] = { ...it, product_id: pid, variation_id: vid, quantity: Number(it.quantity || 0) };
      } else {
        mergedMap[key].quantity = Number(mergedMap[key].quantity || 0) + Number(it.quantity || 0);
      }
    };

    // Add existing server items
    (serverCart.products || []).forEach(pushItem);
    // Merge in guest items (summing quantities)
    (guestCart.products || []).forEach(pushItem);

    const mergedProducts = Object.keys(mergedMap).map((k) => mergedMap[k]);
    const newCart = { products: mergedProducts };

    // Persist merged cart to customer's meta
    await cartLib.setCartForCustomer(wpCustomerId, newCart);

    const res = NextResponse.json({ ok: true, cart: newCart });

    // Update logged in user cart cookie
    res.cookies.set("loggin_user_cart", JSON.stringify(newCart), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    // Clear guest cookie after successful merge
    res.cookies.set("guest_cart_order", "", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
