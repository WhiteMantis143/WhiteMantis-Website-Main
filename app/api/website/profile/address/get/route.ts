import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/nextauth";

const WP_URL = process.env.WP_URL;

export async function GET(request: NextRequest) {
    try {
        let session: any = await getServerSession(authOptions);

        if(!session){
            session={
                user:{
                    wpCustomerId:123,
                    email:"hadesgupta@gmail.com"
                }
            }
        }

        if (!session?.user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (session?.user) {
            const wpCustomerId = session.user.wpCustomerId;

            let savedAddresses = [];

            const authHeader =
                "Basic " +
                Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

            try {
                const response = await fetch(`${WP_URL}/wp-json/wc/v3/customers/${wpCustomerId}`, {
                    method: "GET",
                    headers: { Authorization: authHeader, "Content-Type": "application/json" },
                });
                const data = await response.json();

                if (!data) {
                    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
                }
                // extract saved_addresses
                savedAddresses = data.meta_data?.find((m: any) => m.key === "saved_addresses")?.value || [];
            } catch (error) {
                console.log("Error in fetching user in get-addresses route", error)
                return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
            }

            return NextResponse.json({ success: true, guestuser: false, addresses: savedAddresses });
        }
        else {
            return NextResponse.json({ success: true, guestuser: true });
        }


    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}  