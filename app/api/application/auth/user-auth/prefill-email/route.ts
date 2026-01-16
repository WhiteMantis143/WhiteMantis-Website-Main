import { NextResponse } from "next/server";
import { decrypt } from "../../../../../../lib/crypto";

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { email: null },
      { status: 200 }
    );
  }

  const { encryptedEmail } = body || {};

  if (!encryptedEmail) {
    return NextResponse.json(
      { email: null },
      { status: 200 }
    );
  }

  try {
    const data = decrypt(encryptedEmail);

    // Check if email exists
    if (!data?.email) {
      return NextResponse.json(
        { email: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { email: data.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ App prefill-email error:", error);
    return NextResponse.json(
      { email: null },
      { status: 200 }
    );
  }
}
