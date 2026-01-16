import { NextResponse } from "next/server";
import cookie from "cookie";
import { decrypt } from "../../../../../../lib/crypto";

export async function GET(req: Request) {
  try {
    const rawCookie = req.headers.get("cookie");

    if (!rawCookie) {
      return NextResponse.json(
        { email: null, error: "No cookies found" },
        { status: 200 }
      );
    }

    const cookies = cookie.parse(rawCookie);
    const encryptedEmail = cookies.encryptedEmail;

    if (!encryptedEmail) {
      return NextResponse.json(
        { email: null, error: "Email cookie missing" },
        { status: 200 }
      );
    }

    let data;
    try {
      data = decrypt(encryptedEmail);
    } catch (err) {
      console.error("❌ Failed to decrypt encryptedEmail cookie:", err);
      return NextResponse.json(
        { email: null, error: "Invalid email session" },
        { status: 200 }
      );
    }

    if (!data?.email) {
      return NextResponse.json(
        { email: null, error: "Email not found in cookie" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { email: data.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Prefill email unexpected error:", error);
    return NextResponse.json(
      { email: null, error: "Internal server error" },
      { status: 200 }
    );
  }
}
    