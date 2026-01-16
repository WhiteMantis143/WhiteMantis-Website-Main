import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/nextauth";
import { findCustomerByEmail } from "../../../../../lib/woo";

async function getSession() {
    try {
        return (await getServerSession(authOptions)) as any;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();

    if (!session?.user?.email) {
        return NextResponse.json(
            { ok: false, error: "Not authenticated" },
            { status: 401 }
        );
    }

    const cookies = req.cookies;
    const guestProfileRaw = cookies.get("guest_profile")?.value;

    // If there's no guest profile cookie, nothing to merge
    if (!guestProfileRaw) {
        return NextResponse.json({
            ok: true,
            message: "No guest profile to merge",
        });
    }

    let guestProfile: any = {};
    try {
        guestProfile = JSON.parse(guestProfileRaw);
    } catch {
        // Malformed cookie - treat as empty
        guestProfile = {};
    }

    try {
        const email = session.user.email;

        // Fetch current customer to check if they already have saved addresses in metadata
        const customer = await findCustomerByEmail(email);

        if (!customer) {
            return NextResponse.json(
                { ok: false, error: "Customer not found" },
                { status: 404 }
            );
        }

        // Check if user already has saved_addresses in metadata
        const savedAddressesMeta = customer.meta_data?.find(
            (meta: any) => meta.key === "saved_addresses"
        );

        const hasSavedAddresses =
            savedAddressesMeta &&
            Array.isArray(savedAddressesMeta.value) &&
            savedAddressesMeta.value.length > 0;

        // Skip merge if user already has saved addresses in metadata
        if (hasSavedAddresses) {
            const res = NextResponse.json({
                ok: true,
                message: "User already has saved addresses - profile merge skipped",
                skipped: true,
            });

            // Still clear the guest cookie
            res.cookies.set("guest_profile", "", {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                maxAge: 0,
            });

            return res;
        }

        // Prepare data to send to update route
        let updatePayload: any = {};

        // If guest has saved addresses, merge them into user metadata
        if (guestProfile.saved_addresses && Array.isArray(guestProfile.saved_addresses) && guestProfile.saved_addresses.length > 0) {
            // Add all saved addresses to metadata
            updatePayload.saved_addresses = guestProfile.saved_addresses;

            // Also update billing/shipping address fields (but NOT name or phone)
            const firstAddress = guestProfile.saved_addresses[0];
            updatePayload.address_1 = firstAddress.address_1 || "";
            updatePayload.address_2 = firstAddress.address_2 || "";
            updatePayload.city = firstAddress.city || "";
            updatePayload.state = firstAddress.state || "";
            updatePayload.postcode = firstAddress.postcode || "";
            updatePayload.country = firstAddress.country || "";
        }

        // Merge other guest profile fields (gender, etc.)
        if (guestProfile.gender) {
            updatePayload.gender = guestProfile.gender;
        }

        // Call the update route internally
        if (Object.keys(updatePayload).length > 0) {
            const updateResponse = await fetch(
                `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/website/profile/update`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: req.headers.get("cookie") || "",
                    },
                    body: JSON.stringify(updatePayload),
                }
            );

            if (!updateResponse.ok) {
                throw new Error("Failed to update profile");
            }
        }

        const res = NextResponse.json({
            ok: true,
            message: "Profile merged successfully",
            mergedAddresses: guestProfile.saved_addresses?.length || 0,
        });

        // Clear guest profile cookie after successful merge
        res.cookies.set("guest_profile", "", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 0,
        });

        return res;
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: String(err?.message || err) },
            { status: 500 }
        );
    }
}
