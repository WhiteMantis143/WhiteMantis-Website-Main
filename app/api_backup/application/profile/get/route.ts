import { NextResponse } from "next/server";
import { decrypt } from "../../../../../lib/crypto";
import { findCustomerByEmail } from "../../../../../lib/woo";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const encryptedEmail = searchParams.get("email");

        if (!encryptedEmail) {
            return NextResponse.json(
                { error: "Email parameter is required" },
                { status: 400 }
            );
        }

        // Decrypt the email
        let email: string;
        try {
            const data = decrypt(encryptedEmail);
            email = data.email;
        } catch (decryptError: any) {
            console.error("❌ Email decryption error:", decryptError);
            return NextResponse.json(
                { error: "Invalid or corrupted email parameter" },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Fetch customer from WooCommerce
        try {
            const customer = await findCustomerByEmail(email);

            if (!customer) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }

            // Return user profile data with all metadata
            return NextResponse.json({
                success: true,
                profile: {
                    id: customer.id,
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    username: customer.username,
                    displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.username,
                    avatar: customer.avatar_url,
                    billing: customer.billing,
                    shipping: customer.shipping,
                    dateCreated: customer.date_created,
                    dateModified: customer.date_modified,
                    role: customer.role,
                    metaData: customer.meta_data || [],
                },
            });
        } catch (wooError: any) {
            console.error("❌ WooCommerce API error:", wooError);

            // Check if it's a configuration error
            if (wooError.message?.includes("Missing required environment variable")) {
                return NextResponse.json(
                    {
                        error: "Server configuration error",
                        details: "WooCommerce credentials not configured"
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: "Failed to fetch user profile", details: wooError.message },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("❌ Profile API error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
