import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/nextauth";

const WP_URL = process.env.WP_URL;

export async function GET(req: NextRequest) {
    let session: any = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.wpCustomerId || session.user.id;

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '10';

    const authHeader =
        "Basic " +
        Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

    try {
        const response = await fetch(`${WP_URL}/wp-json/wc/v3/orders?customer=${userId}&page=${page}&per_page=${perPage}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
    }
}