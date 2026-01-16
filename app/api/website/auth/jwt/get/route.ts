import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.WP_URL;
const WP_SECRET = process.env.NEXTAUTH_SECRET; // WordPress shared secret

export async function POST(req: NextRequest) {
    if (!WP_URL) {
        return NextResponse.json(
            { ok: false, error: "Server misconfigured" },
            { status: 500 }
        );
    }

    if (!WP_SECRET) {
        console.error("❌ NEXTAUTH_SECRET not configured");
        return NextResponse.json(
            { ok: false, error: "Server misconfigured" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { ok: false, error: "Email is required" },
                { status: 400 }
            );
        }

        // Call WordPress custom OAuth JWT endpoint with secret header
        console.log("🔵 Calling WordPress endpoint for:", email);

        const wpResponse = await fetch(
            `${WP_URL.replace(/\/$/, "")}/wp-json/custom-auth/v1/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Nextauth-Secret": WP_SECRET, // WordPress will validate this
                },
                cache: "no-store",
                body: JSON.stringify({ email }),
            }
        );

        console.log("🔵 WordPress response status:", wpResponse.status);

        if (!wpResponse.ok) {
            const err = await wpResponse.json().catch(() => null);
            console.error("❌ WordPress OAuth JWT fetch failed:", wpResponse.status, err);
            return NextResponse.json(
                {
                    ok: false,
                    error: err?.message || "Failed to fetch JWT from WordPress",
                },
                { status: wpResponse.status }
            );
        }

        const wpData = await wpResponse.json();
        console.log("🔵 WordPress response data:", wpData);

        // WordPress returns { success: true, token: "...", user: {...}, expires_at: ... }
        if (!wpData?.token && !wpData?.success) {
            console.error("❌ No token in WordPress response:", wpData);
            return NextResponse.json(
                { ok: false, error: "No token returned from WordPress" },
                { status: 500 }
            );
        }

        const jwtToken = wpData.token;

        // Create response with user data
        const response = NextResponse.json({
            ok: true,
            user: wpData.user,
            token: jwtToken,
        });

        // Set JWT token as HTTP-only cookie
        response.cookies.set("jwt_token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("❌ Social login JWT fetch error:", error);
        return NextResponse.json(
            { ok: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
