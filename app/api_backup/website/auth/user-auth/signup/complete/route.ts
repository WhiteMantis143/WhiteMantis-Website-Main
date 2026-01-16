import { NextResponse } from "next/server";
import cookie from "cookie";
import { decrypt } from "../../../../../../../lib/crypto";
import {
  findCustomerByEmail,
  updateCustomerById,
} from "../../../../../../../lib/woo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, gender } = body || {};

    // Parse cookies
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const encryptedEmail = cookies.encryptedEmail;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone number are required" },
        { status: 400 }
      );
    }

    const cleanNumber = phone.replace(/\D/g, '');
    const uaeRegex = /^(?:00971|971|0)?(5[024568]|2|3|4|6|7|9)\d{7}$/;
    const match = cleanNumber.match(uaeRegex);

    if (!match) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!encryptedEmail) {
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    // Decrypt email
    let emailData;
    try {
      emailData = decrypt(encryptedEmail);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid session data" },
        { status: 401 }
      );
    }

    const email = emailData.email;

    // Find existing WordPress customer
    const customer = await findCustomerByEmail(email);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    // Split name
    const nameParts = name.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const updatePayload: any = {
      first_name,
      last_name,
      billing: {
        first_name,
        last_name,
        phone,
      },
      shipping: {
        first_name,
        last_name,
      },
    };

    if (gender) {
      updatePayload.meta_data = [
        {
          key: "gender",
          value: gender,
        },
      ];
    }

    await updateCustomerById(customer.id, updatePayload);

    const res = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });

    return res;
  } catch (e: any) {
    console.error("signup complete error", e);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
