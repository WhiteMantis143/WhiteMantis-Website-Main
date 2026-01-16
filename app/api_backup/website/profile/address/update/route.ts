import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/nextauth";
import { updateCustomerById, findCustomerByEmail } from "../../../../../../lib/woo";

const WP_URL = Number(process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL);

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        const body = await req.json();

        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
        }

        const {
            address_id,
            ...addressData
        } = body;

        // --- LOGGED IN CHECK ---
        if (!session?.user) {
            return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
        }

        let wpCustomerId = session.user.wpCustomerId;
        if (!wpCustomerId) {
            const existing = await findCustomerByEmail(session.user.email).catch(() => null);
            wpCustomerId = existing?.id;
        }

        if (!wpCustomerId) {
            return NextResponse.json({ message: "Customer not found" }, { status: 400 });
        }

        // --- FETCH EXISTING CUSTOMER DATA ---
        let savedAddresses: any[] = [];
        let currentCustomer: any = null;

        const authHeader = "Basic " + Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

        // We need to fetch the customer first to get current addresses
        try {
            const response = await fetch(`${process.env.WP_URL}/wp-json/wc/v3/customers/${wpCustomerId}`, {
                method: "GET",
                headers: { Authorization: authHeader, "Content-Type": "application/json" },
            });
            currentCustomer = await response.json();
            savedAddresses = currentCustomer.meta_data?.find((m: any) => m.key === "saved_addresses")?.value || [];
        } catch (err) {
            console.error("Error fetching customer", err);
            return NextResponse.json({ message: "Failed to fetch customer data" }, { status: 500 });
        }

        let updatedAddresses = [...savedAddresses];

        // --- UPDATE OR ADD LOGIC ---
        if (address_id) {
            // Update existing
            const index = updatedAddresses.findIndex((addr: any) => addr.id == address_id);
            if (index !== -1) {
                updatedAddresses[index] = {
                    ...updatedAddresses[index],
                    ...addressData,
                    id: address_id // Ensure ID is preserved/consistent
                };
            } else {
                return NextResponse.json({ message: "Address ID not found" }, { status: 404 });
            }
        } else {
            // Add new
            if (updatedAddresses.length >= 5) {
                return NextResponse.json({ success: false, message: "Maximum 5 addresses allowed" }, { status: 400 });
            }
            const newId = Date.now();
            updatedAddresses.push({
                ...addressData,
                id: newId
            });
        }

        // Handle Default Address Logic within the list
        if (addressData.setAsDefault) {
            updatedAddresses = updatedAddresses.map((addr) => {
                if ((address_id && addr.id == address_id) || (!address_id && addr === updatedAddresses[updatedAddresses.length - 1])) {
                    return { ...addr, setAsDefault: true };
                }
                return { ...addr, setAsDefault: false };
            });
        }

        // --- PREPARE WOOCOMMERCE UPDATE PAYLOAD ---
        const payload: any = {};

        // Update main Profile Billing/Shipping if this address is default
        if (addressData.setAsDefault) {
            payload.billing = {
                first_name: addressData.firstName || "",
                last_name: addressData.lastName || "",
                address_1: addressData.address || "",
                address_2: addressData.apartment || "",
                city: addressData.city || "",
                state: addressData.state || "",
                country: addressData.country || "",
                phone: addressData.phone || "",
            };
            payload.shipping = { ...payload.billing };
        }

        // Update Meta
        const meta: Record<string, any> = {
            saved_addresses: updatedAddresses
        };

        payload.meta_data = Object.entries(meta).map(([key, value]) => ({
            key,
            value,
        }));

        // --- EXECUTE UPDATE ---
        let updated;
        try {
            updated = await updateCustomerById(wpCustomerId, payload);
        } catch (error: any) {
            console.error("Error updating customer", error);
            return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 });
        }

        return NextResponse.json({ success: true, customer: updated, addresses: updatedAddresses }, { status: 200 });

    } catch (e: any) {
        console.error("address update error", e);
        return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
    }
}
