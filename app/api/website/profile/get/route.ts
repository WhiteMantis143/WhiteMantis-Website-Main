import { NextResponse } from "next/server";
import { findCustomerByEmail } from "../../../../../lib/woo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const cookieStore = await cookies();

    // GUEST MODE: If not logged in, return profile from cookies
    if (!session?.user) {
      const guestProfileCookie = cookieStore.get("guest_profile")?.value;

      if (guestProfileCookie) {
        try {
          const guestProfile = JSON.parse(guestProfileCookie);
          return NextResponse.json({
            success: true,
            isGuest: true,
            profile: guestProfile,
          });
        } catch (e) {
          console.error("Failed to parse guest profile cookie:", e);
        }
      }

      // No guest profile, return empty profile
      return NextResponse.json({
        success: true,
        isGuest: true,
        profile: {
          full_name: "",
          phone: "",
          gender: "",
          saved_addresses: [],
          metaData: [],
        },
      });
    }

    // LOGGED IN MODE: Fetch from WooCommerce
    const email = session.user.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in session" },
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

      // Fetch profile image URL if profile_image_id exists
      let profileImageUrl = customer.avatar_url;
      const profileImageId = customer.meta_data?.find((m: any) => m.key === 'profile_image_id')?.value;

      if (profileImageId) {
        try {
          const WP_URL = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL;
          const authHeader = "Basic " + Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

          const mediaResponse = await fetch(`${WP_URL}/wp-json/wp/v2/media/${profileImageId}`, {
            headers: { 'Authorization': authHeader },
          });

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            profileImageUrl = mediaData.source_url || profileImageUrl;
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }

      // Return user profile data with all metadata
      return NextResponse.json({
        success: true,
        isGuest: false,
        profile: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          username: customer.username,
          displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.username,
          avatar: profileImageUrl,
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
