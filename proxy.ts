import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(req: NextRequest) {
    const origin = req.headers.get("origin");
    const allowedOrigins = [
        "https://localhost",                 // Capacitor Android
        "capacitor://localhost",             // Capacitor internal
        "ionic://localhost",
        "http://localhost:8100",              // Ionic dev
        "http://localhost:5173",              // Vite dev
    ];
    // Handle preflight requests
    if (req.method === "OPTIONS") {
        const res = NextResponse.next();
        if (origin && allowedOrigins.includes(origin)) {
            res.headers.set("Access-Control-Allow-Origin", origin);
        }
        res.headers.set("Access-Control-Allow-Credentials", "true");
        res.headers.set(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,DELETE,OPTIONS"
        );
        res.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );
        return res;
    }
    const res = NextResponse.next();
    if (origin && allowedOrigins.includes(origin)) {
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return res;
}
export const config = {
    matcher: ["/api/application/:path*"],
};