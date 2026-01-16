import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { WP_URL, NEXTAUTH_SECRET } = process.env;

    if (!WP_URL || !NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Forward query params safely
    const query = new URLSearchParams();

    if (searchParams.get("page"))
      query.set("page", searchParams.get("page")!);

    if (searchParams.get("per_page"))
      query.set("per_page", searchParams.get("per_page")!);

    if (searchParams.get("search"))
      query.set("search", searchParams.get("search")!);

    const queryString = query.toString();
    const url = `${WP_URL}/wp-json/wm/v1/stores${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Secret": NEXTAUTH_SECRET,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Failed to fetch stores",
          details: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Stores API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}