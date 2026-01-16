import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { WP_URL, NEXTAUTH_SECRET } = process.env;

    if (!WP_URL || !NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const { storeId } = await params;

    const url = `${WP_URL}/wp-json/wm/v1/stores/${storeId}/categories`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 🔐 Must match WM_API_SECRET
        "X-Auth-Secret": NEXTAUTH_SECRET,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Failed to fetch store categories",
          details: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Store categories API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
