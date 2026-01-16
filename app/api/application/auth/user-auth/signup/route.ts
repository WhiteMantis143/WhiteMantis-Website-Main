import { NextResponse } from "next/server";
import crypto from "crypto";
import { encrypt } from "../../../../../../lib/crypto";
import { createCustomer, findCustomerByEmail } from "../../../../../../lib/woo";

const WC_URL = process.env.WP_URL + "/wp-json/wc/v3/customers"
const WC_KEY = process.env.WC_CONSUMER_KEY
const WC_SECRET = process.env.WC_CONSUMER_SECRET

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const existing = await findCustomerByEmail(email);

    if (existing) {
      // Allow any existing user to use OTP login, regardless of original signup method
      const emailPayload = encrypt({
        email
      });

      return NextResponse.json(
        {
          success: true,
          accountExists: true,
          encryptedEmail: emailPayload,
        },
        { status: 200 }
      );
    }

    // 🔵 New user

    const authHeader =
      "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

    try {
      const createRes = await fetch(WC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          email,
          password: crypto.randomBytes(10).toString("hex"),
        }),
      });


      if (!createRes.ok) {
        console.log("signup error", createRes);
        return NextResponse.json(
          {
            success: false,
            message: "Internal Server Error",
          },
          { status: createRes.status || 500 }
        );
      }
      const createdUser = await createRes.json();
      console.log("Created user:", createdUser);

      console.log(`${WC_URL}/${createdUser.id}`)

      // 2. If user created, update meta
      if (createdUser?.id) {
        const updateRes = await fetch(`${WC_URL}/${createdUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({
            meta_data: [
              { key: "temp_user", value: "true" }
            ]
          }),
        });

      }
    } catch (e) {
      console.error("signup error", e);
      return NextResponse.json(
        { success: false, message: "Signup failed" },
        { status: 500 }
      );
    }

    const payload = {
      email,
      nonce: crypto.randomUUID(),
    };

    const encrypted = encrypt(payload);

    return NextResponse.json(
      {
        success: true,
        accountExists: false,
        encryptedEmail: encrypted,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("signup error", e);
    return NextResponse.json(
      { success: false, message: "Signup failed" },
      { status: 500 }
    );
  }
}
