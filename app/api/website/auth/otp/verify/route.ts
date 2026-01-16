import { NextResponse } from "next/server";
import { decrypt, encrypt } from "../../../../../../lib/crypto";
import cookie from "cookie";

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const encryptedEmail = cookies.encryptedEmail

    if (!otp || !encryptedEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const cleanOtp = String(otp).replace(/\s+/g, "");

    if (otp === "") {
      return NextResponse.json(
        { success: false, message: "OTP required" },
        { status: 400 }
      );
    }
    const otpNumber = Number(cleanOtp);

    // Decrypt pending signup data
    let pendingData: any;
    try {
      pendingData = decrypt(encryptedEmail);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid signup data" },
        { status: 401 }
      );
    }

    // Normalize email (trim and lowercase) to ensure consistent matching
    const email = pendingData.email.trim().toLowerCase();

    const authHeader =
      "Basic " +
      Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

    let existingUser: any
    try {
      const response = await fetch(
        process.env.WP_URL + "wp-json/wc/v3/customers?email=" + encodeURIComponent(email),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            message: err.message || "WordPress error",
            error: err.code || "unknown_error",
          },
          { status: err.data?.status || response.status || 500 }
        );
      }

      existingUser = await response.json();

      if (!existingUser || existingUser.length === 0) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

    } catch (e) {
      console.error("application/auth/otp/verify route error:", e);
      return NextResponse.json(
        { success: false, message: "Failed to verify OTP" },
        { status: 500 }
      );
    }

    const meta = existingUser[0].meta_data?.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {}) || {};

    const isTempUser = meta["temp_user"] === "true";
    const storedOtp = meta["otp"];
    const otpIsUsed = meta["otp_is_used"] === "true";
    const otpCreatedAt = meta["otp_created_at"];
    const otpExpiry = Number(meta["otp_expiry"]);

    if (otpIsUsed) {
      return NextResponse.json(
        { success: false, message: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const EXP_SEC = 5 * 60; // 5 minutes

    // Method 1: using otp_expiry timestamp
    const expiredByTimestamp = nowSec > otpExpiry;

    // Method 2: using otp_created_at MySQL/ISO time
    let expiredByCreatedAt = false;
    if (otpCreatedAt) {
      const createdSec = Math.floor(new Date(otpCreatedAt).getTime() / 1000);
      expiredByCreatedAt = nowSec > createdSec + EXP_SEC;
    }

    // Final check: if ANY method says expired → delete/block
    if (expiredByTimestamp || expiredByCreatedAt || otpExpiry === 0) {
      return NextResponse.json(
        { success: false, message: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    if (String(storedOtp) !== String(otpNumber)) {
      return NextResponse.json(
        { success: false, message: "OTP expired or invalid" },
        { status: 400 }
      );
    }
    let isNewUser = false;

    if (isTempUser) {
      isNewUser = true;
    }

    // Auto-login: Get JWT token for the user
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
      `http://localhost:${process.env.PORT || 3000}`;

    const jwtResponse = await fetch(`${baseUrl}/api/application/auth/jwt/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    let jwtToken = null;
    if (jwtResponse.ok) {
      const jwtData = await jwtResponse.json();
      jwtToken = jwtData.token;
      console.log("✅ JWT token generated for:", email);
    } else {
      console.error("❌ Failed to generate JWT token");
      return NextResponse.json(
        { success: false, message: "Failed to generate authentication token" },
        { status: 500 }
      );
    }

    // Encrypt email for pre-fill (no expiry)
    const emailPayload = encrypt({
      email
    });

    try {
      const auth =
        "Basic " +
        Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

      const userId = existingUser[0].id;

      if (!userId) {
        return NextResponse.json({ success: false, message: "User not found or invalid response from WordPress" }, { status: 404 });
      }

      // 2. Update OTP meta after verification
      const updateRes = await fetch(
        process.env.WP_URL + "wp-json/wc/v3/customers/" + userId,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": auth,
          },
          body: JSON.stringify({
            meta_data: [
              { key: "temp_user", value: "false" },
              { key: "otp_is_used", value: "true" },
            ],
          }),
        }
      );

      if (!updateRes.ok) {
        return NextResponse.json(
          { success: false, message: "WordPress error while updating OTP meta", error: "wc_update_failed" },
          { status: updateRes.status }
        );
      }

      const res = NextResponse.json({
        success: true,
        jwt: jwtToken,
        isNewUser,
        encryptedEmail: emailPayload,
        message: "OTP verified"
      });

      // Set JWT token as HTTP-only cookie
      res.cookies.set("jwt_token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return res;

    } catch (e: any) {
      console.error("application/auth/otp/verify route error:", e);
      return NextResponse.json(
        { success: false, message: e.message || "Failed to verify OTP", error: "exception" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
