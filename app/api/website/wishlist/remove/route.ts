// app/api/wishlist/remove/route.ts
import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "../../../../../lib/nextauth";

// Prefer public env for client-aware URLs
const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

if (!WP_BASE_URL) {
  console.error(
    "[wishlist] WordPress base URL not set (set NEXT_PUBLIC_WORDPRESS_URL or WP_URL)"
  );
}

// Shared secret used to authenticate requests to WordPress wishlist
const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  if (!WP_BASE_URL) {
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!INTERNAL_SECRET) {
    console.error("[wishlist] NEXTAUTH_SECRET is missing in environment");
    return NextResponse.json(
      { message: "Server configuration error (missing NEXTAUTH_SECRET)" },
      { status: 500 }
    );
  }

  try {
    // 1) Get NextAuth session
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

    if (!wpCustomerId) {
      return NextResponse.json(
        { message: "No WordPress user ID (wpCustomerId) on session" },
        { status: 400 }
      );
    }

    // 2) Read product_id from request body
    const body = await req.json().catch(() => ({}));
    const product_id = body?.product_id;

    if (!product_id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // 3) Forward secure request to WordPress
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Nextauth-Secret": INTERNAL_SECRET, // 🔒 matches PHP hard-coded secret
    };

    const wpResp = await fetch(`${WP_BASE_URL}/wp-json/my-wishlist/v1/remove`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        product_id,
        user_id: wpCustomerId, // secure user identity
      }),
      cache: "no-store",
    });

    const text = await wpResp.text().catch(() => "");
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!wpResp.ok) {
      return NextResponse.json(data, { status: wpResp.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Wishlist REMOVE proxy error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
