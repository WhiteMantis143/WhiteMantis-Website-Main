import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const WP_API =
      process.env.WORDPRESS_API_URL ||
      "https://wordpressbackend.whitemantis.ae/wp-json/custom/v1/contact";

    const wpRes = await fetch(WP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Submission failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}