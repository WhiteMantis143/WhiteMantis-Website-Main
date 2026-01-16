// ...existing code...
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/nextauth";
import cookie from 'cookie'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let code = searchParams.get("code");

  const session: any = await getServerSession(authOptions);

  if (!session?.user?.wpCustomerId) {
    return NextResponse.json(
      { success: false, message: "Login to Use Coupans" },
      { status: 400 }
    );
  }

  const wpCustomerId = Number(session.user.wpCustomerId);

  if (!code || code.trim() === "") {
    return NextResponse.json(
      { success: false, message: "Coupan code is required" },
      { status: 400 }
    );
  }

  code = code.toUpperCase();

  if (
    !process.env.WC_CONSUMER_KEY ||
    !process.env.WC_CONSUMER_SECRET ||
    !process.env.WC_API_URL
  ) {
    return NextResponse.json(
      { success: false, message: "Server configuration missing" },
      { status: 500 }
    );
  }

  const authHeader =
    "Basic " +
    Buffer.from(
      `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
    ).toString("base64");

  try {
    const response = await fetch(
      `${process.env.WC_API_URL}wp-json/wc/v3/coupons?code=${encodeURIComponent(
        code
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authHeader}`,
        },
      }
    );
    const coupanData = await response.json();

    if (!response.ok) {
      return NextResponse.json(coupanData, { status: response.status });
    }

    if (Array.isArray(coupanData) && coupanData.length === 0) {
      return NextResponse.json(
        { success: false, message: "Inavalid Coupan Code" },
        { status: 404 }
      );
    }

    const expiryDate = new Date(coupanData[0].date_expires);
    const now = new Date();

    // Coupan For App or Website

    const couponFor = coupanData[0].meta_data?.find((m: any) => m.key === "coupan_for")?.value || null;

    if (couponFor === "app") {
      return NextResponse.json(
        { success: false, message: "Coupan is not valid for this platform" },
        { status: 404 }
      );
    }


    // Expiry date validation
    if (now.getTime() > expiryDate.getTime()) {
      return NextResponse.json(
        { success: false, message: "Coupan is expired" },
        { status: 404 }
      );
    }

    // Usage limit validation       

    if (coupanData[0].usage_limit) {
      if (coupanData[0].usage_count >= coupanData[0].usage_limit) {
        return NextResponse.json(
          { success: false, message: "Coupan is expired" },
          { status: 404 }
        );
      }
    }

    //One user per coupan Validation
    if (coupanData[0].usage_limit_per_user) {
      try {
        const ordersRes = await fetch(
          `${process.env.WC_API_URL}wp-json/wc/v3/orders?customer=${wpCustomerId}`,
          {
            headers: { Authorization: authHeader },
          }
        );

        const ordersData = await ordersRes.json();

        if (!Array.isArray(ordersData)) {
          return NextResponse.json(
            { ok: false, error: "Failed to fetch orders" },
            { status: 500 }
          );
        }

        const couponId = coupanData[0].id;

        const usedOrders = ordersData.filter((order: any) => {
          const hasCoupon = order.coupon_lines?.some((c: any) => Number(c.id) === couponId);

          const validStatus =
            order.status === "processing" ||
            order.status === "completed" ||
            order.status === "pending";

          return hasCoupon && validStatus;
        });

        const ordersCount = usedOrders.length;

        if (ordersCount >= coupanData[0].usage_limit_per_user) {
          return NextResponse.json(
            { success: false, message: "Coupan is already used" },
            { status: 404 }
          );
        }
      }
      catch (error) {
        console.log("Error fetching orders:", error);
        return NextResponse.json(
          { success: false, message: "Internal Server Error" },
          { status: 500 }
        );
      }
    }
    const cookieHeader = request.headers.get("cookie");
    const parsedCookies = cookieHeader ? cookie.parse(cookieHeader) : {};
    const cart = parsedCookies.logged_in_user_cart;
    const cartData = cart ? JSON.parse(cart) : null

    const getTotal = () => {
      return cartData.products.reduce(
        (sum: number, it: any) => sum + Number(it.price?.product_subtotal || 0),
        0
      );
    };

    const total = Number(getTotal());
    const minimumAmount = Number(coupanData[0].minimum_amount);

    if (minimumAmount > total) {
      return NextResponse.json({
        success: false,
        message: `Minimum amount not met`
      });
    }

    const coupon = coupanData[0];
    const apiResponse = NextResponse.json(
      { success: true, message: "Coupan applied successfully", coupon },
      { status: 200 }
    );

    const cookieValue = cookie.serialize("applied_coupon", JSON.stringify({ code: coupon.code, wpCustomerId: wpCustomerId }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    apiResponse.headers.append("Set-Cookie", cookieValue);

    return apiResponse;

  } catch (error) {
    console.log("Error fetching coupan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
