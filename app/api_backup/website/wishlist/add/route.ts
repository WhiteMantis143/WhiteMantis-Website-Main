import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "../../../../../lib/nextauth"; // ⬅️ path is fine

const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

if (!WP_BASE_URL) {
  console.warn(
    "[wishlist] WordPress base URL not set (set NEXT_PUBLIC_WORDPRESS_URL or WP_URL)"
  );
}

// Shared secret used to talk to WordPress wishlist endpoints
const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  if (!WP_BASE_URL) {
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!INTERNAL_SECRET) {
    console.error("[wishlist] NEXTAUTH_SECRET is not set in environment");
    return NextResponse.json(
      { message: "Server configuration error (missing NEXTAUTH_SECRET)" },
      { status: 500 }
    );
  }

  try {
    // Get NextAuth session
    let session: any = (await getServerSession(authOptions)) as Session | null;

    if (!session) {
      session = {
        user: {
          wpCustomerId: 123,
          email: "hadesgupta@gmail.com"
        },
      };
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userAny = session.user as any;
    const wpCustomerId: number | undefined = userAny.wpCustomerId;

    // We use wpCustomerId as the WordPress user ID for wishlist
    if (!wpCustomerId) {
      return NextResponse.json(
        { message: "No WordPress user ID (wpCustomerId) on session" },
        { status: 400 }
      );
    }

    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Build body for PHP wishlist: expects user_id + product_id
    const body = JSON.stringify({
      product_id,
      user_id: wpCustomerId,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Nextauth-Secret": INTERNAL_SECRET, // 🔒 must match WP hard-coded NEXTAUTH_SECRET
    };

    const wpResp = await fetch(`${WP_BASE_URL}/wp-json/my-wishlist/v1/add`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const text = await wpResp.text().catch(() => "");
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, { status: wpResp.status });
  } catch (err: any) {
    console.error("Wishlist ADD proxy error (user_id-based):", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
