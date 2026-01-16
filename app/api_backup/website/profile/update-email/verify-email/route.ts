import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/nextauth";

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const currentEmail = session.user.email;

        const { otp } = await req.json();

        if (!otp) {
            return NextResponse.json(
                { success: false, message: "OTP is required" },
                { status: 400 }
            );
        }

        // Clean and validate OTP
        const cleanOtp = String(otp).replace(/\s+/g, "");

        if (cleanOtp === "") {
            return NextResponse.json(
                { success: false, message: "OTP required" },
                { status: 400 }
            );
        }

        // Validate OTP is 4 digits
        if (!/^\d{4}$/.test(cleanOtp)) {
            return NextResponse.json(
                { success: false, message: "Invalid OTP format" },
                { status: 400 }
            );
        }

        const authHeader =
            "Basic " +
            Buffer.from(
                `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
            ).toString("base64");

        // Fetch current user
        const userRes = await fetch(
            `${process.env.WP_URL}wp-json/wc/v3/customers?email=${encodeURIComponent(
                currentEmail
            )}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
            }
        );

        if (!userRes.ok) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const users = await userRes.json();
        if (!users || users.length === 0) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const user = users[0];
        const meta = user.meta_data || [];

        // Read email_change meta
        const emailChangeMeta = meta.find(
            (m: any) => m.key === "email_change"
        );

        if (!emailChangeMeta?.value) {
            return NextResponse.json(
                { success: false, message: "No pending email change request" },
                { status: 400 }
            );
        }

        let emailChangeData: any;
        try {
            emailChangeData = JSON.parse(emailChangeMeta.value);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid email change data" },
                { status: 500 }
            );
        }

        // Validate required fields exist
        if (!emailChangeData.otp || !emailChangeData.pending_email) {
            return NextResponse.json(
                { success: false, message: "Invalid email change data" },
                { status: 400 }
            );
        }

        // Check if OTP is already used (WordPress stores as string)
        if (emailChangeData.otp_is_used === "true") {
            return NextResponse.json(
                { success: false, message: "OTP expired or invalid" },
                { status: 400 }
            );
        }

        // Check OTP expiry (WordPress stores as string, convert to number)
        const nowSec = Math.floor(Date.now() / 1000);
        const otpExpiry = Number(emailChangeData.otp_expiry) || 0;

        // Method 1: using otp_expiry timestamp
        const expiredByTimestamp = nowSec > otpExpiry;

        // Method 2: using otp_created_at
        let expiredByCreatedAt = false;
        if (emailChangeData.otp_created_at) {
            const createdSec = Math.floor(
                new Date(emailChangeData.otp_created_at).getTime() / 1000
            );
            expiredByCreatedAt = nowSec > createdSec + OTP_EXPIRY_SECONDS;
        }

        // If expired by any method
        if (expiredByTimestamp || expiredByCreatedAt || otpExpiry === 0) {
            return NextResponse.json(
                { success: false, message: "OTP expired or invalid" },
                { status: 400 }
            );
        }

        // Verify OTP matches
        if (String(emailChangeData.otp) !== String(cleanOtp)) {
            return NextResponse.json(
                { success: false, message: "OTP expired or invalid" },
                { status: 400 }
            );
        }

        // OTP is valid - now update the email
        const newEmail = emailChangeData.pending_email;

        // Double-check new email is not already in use
        const existingWithNewEmail = await fetch(
            `${process.env.WP_URL}wp-json/wc/v3/customers?email=${encodeURIComponent(
                newEmail
            )}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
            }
        );

        if (existingWithNewEmail.ok) {
            const existingUsers = await existingWithNewEmail.json();
            if (existingUsers && existingUsers.length > 0) {
                // Check if it's not the same user
                if (existingUsers[0].id !== user.id) {
                    return NextResponse.json(
                        { success: false, message: "Email already in use" },
                        { status: 409 }
                    );
                }
            }
        }

        // Update user email and mark OTP as used
        const updateRes = await fetch(
            `${process.env.WP_URL}wp-json/wc/v3/customers/${user.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify({
                    email: newEmail,
                    meta_data: [
                        {
                            key: "email_change",
                            value: JSON.stringify({
                                ...emailChangeData,
                                otp_is_used: "true",
                            }),
                        },
                        {
                            key: "last_email_changed_at",
                            value: new Date().toISOString(),
                        },
                    ],
                }),
            }
        );

        if (!updateRes.ok) {
            const errorData = await updateRes.json().catch(() => ({}));
            console.error("Failed to update email:", errorData);
            return NextResponse.json(
                { success: false, message: "Failed to update email" },
                { status: 500 }
            );
        }

        // Generate new JWT token with updated email for session refresh
        const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
            `http://localhost:${process.env.PORT || 3000}`;

        const jwtResponse = await fetch(`${baseUrl}/api/application/auth/jwt/get`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newEmail }),
        });

        let jwtToken = null;
        if (jwtResponse.ok) {
            const jwtData = await jwtResponse.json();
            jwtToken = jwtData.token;
            console.log("✅ JWT token generated for new email:", newEmail);
        } else {
            console.error("❌ Failed to generate JWT token for new email");
        }

        return NextResponse.json({
            success: true,
            message: "Email updated successfully",
            newEmail,
            jwt: jwtToken, // Include JWT for session refresh
        });
    } catch (e: any) {
        console.error("Email verification error:", e);
        return NextResponse.json(
            { success: false, message: "Failed to verify OTP" },
            { status: 500 }
        );
    }
}
