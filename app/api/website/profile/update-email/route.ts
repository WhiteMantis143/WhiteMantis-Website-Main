import { NextResponse } from "next/server";
import { findCustomerByEmail } from "../../../../../lib/woo";
import { sendEmail } from "../../../../../lib/email";
import { OTPForUpdateEmail } from "../../../../../lib/email-templates";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";

const WC_URL = process.env.WP_URL + "/wp-json/wc/v3/customers";
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_HOURLY_LIMIT = 3;

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const { currentEmail, newEmail } = await req.json();

        if (!currentEmail || !newEmail) {
            return NextResponse.json(
                { success: false, message: "Current email and new email are required" },
                { status: 400 }
            );
        }

        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(newEmail)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            );
        }

        // Ensure new email is not already used
        const existingWithNewEmail = await findCustomerByEmail(newEmail);
        if (existingWithNewEmail) {
            return NextResponse.json(
                { success: false, message: "Email already in use" },
                { status: 409 }
            );
        }

        const authHeader =
            "Basic " +
            Buffer.from(
                `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
            ).toString("base64");

        // Fetch current user (old email owner)
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

        // Check last email change date (10-day restriction)
        const lastEmailChangedMeta = meta.find(
            (m: any) => m.key === "last_email_changed_at"
        );

        if (lastEmailChangedMeta?.value) {
            const lastChangedDate = new Date(lastEmailChangedMeta.value);
            const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

            if (lastChangedDate > tenDaysAgo) {
                const daysRemaining = Math.ceil(
                    (lastChangedDate.getTime() + 10 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)
                );
                return NextResponse.json(
                    {
                        success: false,
                        message: `You can only change your email once every 10 days. Please try again in ${daysRemaining} day(s).`
                    },
                    { status: 429 }
                );
            }
        }

        // Read existing email_change meta
        const emailChangeMeta = meta.find(
            (m: any) => m.key === "email_change"
        );

        let emailChangeData: any = {};
        if (emailChangeMeta?.value) {
            try {
                emailChangeData = JSON.parse(emailChangeMeta.value);
            } catch { }
        }

        // ⏱ Cooldown check
        if (emailChangeData.otp_created_at) {
            const lastMs = new Date(emailChangeData.otp_created_at).getTime();
            if (Date.now() < lastMs + OTP_COOLDOWN_MS) {
                const wait = Math.ceil(
                    (lastMs + OTP_COOLDOWN_MS - Date.now()) / 1000
                );
                return NextResponse.json(
                    { success: false, message: `Please wait ${wait}s before retrying` },
                    { status: 429 }
                );
            }
        }

        // ⛔ Hourly limit check
        let history: number[] = Array.isArray(
            emailChangeData.otp_request_history
        )
            ? emailChangeData.otp_request_history
            : [];

        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        history = history.filter((t) => t > oneHourAgo);

        if (history.length >= OTP_HOURLY_LIMIT) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OTP limit reached. Try again later.",
                },
                { status: 429 }
            );
        }

        history.push(Date.now());

        // 🔢 Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 🧾 Store under ONE meta key
        const updateRes = await fetch(
            `${process.env.WP_URL}wp-json/wc/v3/customers/${user.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify({
                    meta_data: [
                        {
                            key: "email_change",
                            value: JSON.stringify({
                                otp,
                                otp_is_used: "false",
                                otp_created_at: new Date().toISOString(),
                                otp_expiry:
                                    String(Math.floor(Date.now() / 1000) + OTP_EXPIRY_SECONDS),
                                otp_request_history: history,
                                pending_email: newEmail,
                            }),
                        },
                    ],
                }),
            }
        );

        if (!updateRes.ok) {
            throw new Error("Failed to store OTP");
        }

        // 📧 Send OTP to NEW EMAIL
        try {
            console.log(`📧 Attempting to send OTP to: ${newEmail}`);
            await sendEmail({
                to: newEmail,
                subject: "Confirm your email change",
                body: `Your verification code is ${otp}. This code is valid for 5 minutes.`,
                html: OTPForUpdateEmail(otp),
            });
            console.log(`✅ OTP email sent successfully to: ${newEmail}`);
        } catch (emailError: any) {
            console.error("❌ Failed to send OTP email:", emailError);
            throw new Error("Failed to send OTP email. Please check your email configuration.");
        }

        // 🍪 Save newEmail in cookie
        const res = NextResponse.json({
            success: true,
            message: "OTP sent to new email",
        });

        return res;
    } catch (e: any) {
        console.error("Email change OTP error:", e);
        return NextResponse.json(
            { success: false, message: "Failed to send OTP" },
            { status: 500 }
        );
    }
}
