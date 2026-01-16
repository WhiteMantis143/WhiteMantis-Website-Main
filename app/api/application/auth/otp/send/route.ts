import { NextResponse } from "next/server";
import { decrypt } from "../../../../../../lib/crypto";
import { sendEmail } from "../../../../../../lib/email";
import { getOTPEmailTemplate } from "../../../../../../lib/email-templates";

export async function POST(req: Request) {
  const { encryptedEmail } = await req.json();

  if (!encryptedEmail) {
    return NextResponse.json(
      { success: false, message: "Email required" },
      { status: 400 }
    );
  }

  let email: string | undefined;

  try {
    const data = decrypt(encryptedEmail);
    email = data.email;
  } catch (err: any) {
    console.error("application/auth/otp/send route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email required" },
      { status: 400 }
    );
  }

  const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

  const authHeader =
    "Basic " +
    Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

  try {
    // 1. GET user by email
    const getRes = await fetch(
      process.env.WP_URL + "wp-json/wc/v3/customers?email=" + encodeURIComponent(email),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
      }
    );

    if (!getRes.ok) throw new Error("WordPress error while fetching user");

    const users = await getRes.json();

    const meta = users[0].meta_data || [];
    const lastCreated = meta.find((m: any) => m.key === "otp_created_at")?.value;

    // Check 60-second cooldown
    if (lastCreated) {
      const lastMs = new Date(lastCreated).getTime();
      if (Date.now() < lastMs + 60 * 1000) {
        const waitSec = Math.ceil((lastMs + 60 * 1000 - Date.now()) / 1000);
        return NextResponse.json(
          { success: false, message: `Please wait ${waitSec}s before requesting a new OTP` },
          { status: 429 }
        );
      }
    }

    // Check hourly limit (3 OTPs per hour)
    const otpHistoryRaw = meta.find((m: any) => m.key === "otp_request_history")?.value;
    let otpHistory: number[] = [];

    if (otpHistoryRaw) {
      try {
        otpHistory = JSON.parse(otpHistoryRaw);
      } catch (e) {
        otpHistory = [];
      }
    }

    // Filter to keep only requests from the last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds
    const recentRequests = otpHistory.filter((timestamp: number) => timestamp > oneHourAgo);

    // Check if user has already made 3 requests in the last hour
    if (recentRequests.length >= 3) {
      const oldestRequestTime = Math.min(...recentRequests);
      const waitTimeMs = (oldestRequestTime + 60 * 60 * 1000) - Date.now();
      const waitMinutes = Math.ceil(waitTimeMs / (60 * 1000));

      return NextResponse.json(
        {
          success: false,
          message: `OTP limit reached. You can request a new OTP in ${waitMinutes} minute(s).`
        },
        { status: 429 }
      );
    }

    // Add current timestamp to history
    recentRequests.push(Date.now());

    const userId = users[0].id;

    // 2. Update meta using customer ID
    const updateRes = await fetch(
      process.env.WP_URL + "wp-json/wc/v3/customers/" + userId,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          meta_data: [
            { key: "otp", value: generatedOTP },
            { key: "otp_is_used", value: "false" },
            { key: "otp_created_at", value: new Date().toISOString() },
            { key: "otp_expiry", value: (Math.floor(Date.now() / 1000) + 300).toString() },
            { key: "otp_request_history", value: JSON.stringify(recentRequests) },
          ],
        }),
      }
    );

    if (!updateRes.ok) throw new Error("WordPress error while updating meta");


  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }


  try {
    await sendEmail({
      to: email,
      subject: "Your Login Code",
      body: `
   Hi there,
   
   Welcome to White Mantis
   To complete your sign-in, please use the verification code below:
   
   Your verification code:  
   ${generatedOTP}
   
   This code is valid for the next 10 minutes.
   
   Need help? Reach us at: support@whitemantis.com
   
   Happy brewing,  
   Team White Mantis
   `.trim(),
      html: getOTPEmailTemplate(generatedOTP),
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (emailError: any) {
    console.error("❌ Failed to send OTP email:", emailError);

    if (
      emailError.message?.includes("Missing credentials") ||
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER
    ) {
      return NextResponse.json(
        {
          error:
            "Email service not configured. Please configure SMTP settings.",
          details:
            "SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM are required.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send OTP email", details: emailError.message },
      { status: 500 }
    );
  }
}
