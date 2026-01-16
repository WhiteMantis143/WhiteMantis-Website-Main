import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ message: "Media ID is required" }, { status: 400 });
        }

        const WP_BASE = process.env.WP_URL;

        const authHeader =
            "Basic " +
            Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

        // WordPress REST API endpoint for media
        const res = await fetch(`${WP_BASE}/wp-json/wp/v2/media/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader
            },
            cache: "no-store"
        });

        if (res.status === 404) {
            return NextResponse.json({ message: "Media not found" }, { status: 404 });
        }

        if (!res.ok) {
            const errorData = await res.json();
            console.error("WordPress Media API error:", errorData);
            return NextResponse.json({ message: errorData.message || "Failed to fetch media" }, { status: res.status });
        }

        const media = await res.json();

        // Return relevant media information
        return NextResponse.json({
            id: media.id,
            title: media.title?.rendered || "",
            alt_text: media.alt_text || "",
            caption: media.caption?.rendered || "",
            description: media.description?.rendered || "",
            media_type: media.media_type,
            mime_type: media.mime_type,
            source_url: media.source_url,
            media_details: media.media_details,
            date: media.date,
            modified: media.modified,
        }, { status: 200 });

    } catch (error: any) {
        console.error("API /media/[id] error:", error);
        return NextResponse.json(
            { message: error?.message || "Failed to fetch media" },
            { status: 500 }
        );
    }
}
