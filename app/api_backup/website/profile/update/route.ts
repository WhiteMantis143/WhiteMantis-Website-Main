import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import { updateCustomerById, findCustomerByEmail } from "../../../../../lib/woo";

const WP_URL = `${process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL}`;

function splitFullName(fullName?: string) {
  if (!fullName) return {};

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }

  return {
    first_name: parts.slice(0, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const {
      full_name,
      phone,
      gender,
      base64Image,
      ...extraMeta
    } = body;

    if (phone) {
      // Remove spaces, dashes, or "+" if the user entered them
      const cleanPhone = phone.replace(/\D/g, '');

      // UAE local is 10, International is 12. 
      // We allow a range of 9 to 12 to be safe for all UAE formats.
      if (cleanPhone.length < 9 || cleanPhone.length > 12) {
        return NextResponse.json({ success: false, message: "Please enter a valid UAE phone number (10 digits)" }, { status: 400 });
      }
    }

    let profileImage
    if (base64Image) {
      const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ success: false, message: "Invalid image format" }, { status: 400 });
      }

      const mimeType = matches[1]; // e.g., "image/jpeg"
      const base64Data = matches[2];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        return NextResponse.json({ success: false, message: "Only JPG, PNG, and WebP are allowed" }, { status: 400 });
      }

      const sizeInBytes = (base64Data.length * 0.75);
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (sizeInBytes > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Image too large. Max 2MB." }, { status: 400 });
      }

      const imageBuffer = Buffer.from(base64Data, 'base64');

      const authHeader =
        "Basic " +
        Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");
      try {
        const response = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
          method: "POST",
          headers: {
            'Authorization': authHeader,
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="profile-${Date.now()}.jpg"`,
          },
          body: imageBuffer
        })

        if (!response.ok) {
          console.error("WooCommerce API error:", response.status, response.statusText);
          return NextResponse.json({
            success: false,
            message: `Error fetching store address: ${response.statusText}`
          }, { status: 500 });
        }

        const data = await response.json();

        profileImage = {
          id: data.id,
          url: data.source_url,
          name: data.slug,
        };
      }
      catch {
        return NextResponse.json({ success: false, message: "Failed to process image" }, { status: 400 });
      }
    }

    // 2. Validate saved_addresses limit and structure - REMOVED (Handled in profile/address/update)

    // --- GUEST MODE ---
    if (!session?.user?.email) {
      const guestProfile = {
        full_name: full_name || "",
        phone: phone || "",
        gender: gender || "",
        saved_addresses: [], // We don't save addresses in profile update anymore
        ...extraMeta,
      };

      const response = NextResponse.json({ success: true, isGuest: true });
      response.cookies.set("guest_profile", JSON.stringify(guestProfile), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    // --- LOGGED IN MODE ---
    let wpCustomerId = session.user.wpCustomerId;
    if (!wpCustomerId) {
      const existing = await findCustomerByEmail(session.user.email).catch(() => null);
      wpCustomerId = existing?.id;
    }

    if (!wpCustomerId) {
      return NextResponse.json({ message: "Customer not found" }, { status: 400 });
    }

    const payload: any = {};

    // Split full_name into first and last name
    const nameParts = splitFullName(full_name);

    // Update customer's main first_name and last_name fields
    if (nameParts.first_name) {
      payload.first_name = nameParts.first_name;
    }
    if (nameParts.last_name) {
      payload.last_name = nameParts.last_name;
    }

    // 3. Update Name and Phone in Billing/Shipping
    // We strictly only update name/phone here. Addresses are handled in profile/address/update.   
    payload.billing = {
      ...(nameParts.first_name && { first_name: nameParts.first_name }),
      ...(nameParts.last_name && { last_name: nameParts.last_name }),
      ...(phone && { phone }),
    };
    payload.shipping = { ...payload.billing };

    // 4. Update WooCommerce Meta Data
    // We store the specific list of 5 addresses in a custom meta field
    const meta: Record<string, any> = {
      ...(gender !== undefined && { gender }),
      ...(profileImage !== undefined && { profile_image: profileImage }),
      ...extraMeta,
    };

    if (Object.keys(meta).length > 0) {
      payload.meta_data = Object.entries(meta).map(([key, value]) => ({
        key,
        value,
      }));
    }

    let updated;
    try {
      updated = await updateCustomerById(wpCustomerId, payload);
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes('404')) {
        console.warn(`Customer ID ${wpCustomerId} not found (404). Attempting to recover by email...`);
        const recheck = await findCustomerByEmail(session.user.email);
        if (recheck?.id) {
          console.log(`Recovered customer ID: ${recheck.id}. Retrying update...`);
          updated = await updateCustomerById(recheck.id, payload);
        } else {
          throw new Error("Customer account not found in WooCommerce");
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true, customer: updated }, { status: 200 });

  } catch (e: any) {
    console.error("profile update error", e);
    return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}
