import { NextResponse, NextRequest } from "next/server";
import cookie from 'cookie'

export async function GET(request: NextRequest) {

    const apiResponse = NextResponse.json(
        { success: true, message: "Coupan removed successfully" },
        { status: 200 }
    );

    const cookieValue = cookie.serialize("applied_coupon", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    apiResponse.headers.append("Set-Cookie", cookieValue);

    return apiResponse;
}