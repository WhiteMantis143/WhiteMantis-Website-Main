import { NextResponse } from "next/server";
import { decrypt } from "../../../../../../../lib/crypto";
import { findCustomerByEmail, updateCustomerById } from "../../../../../../../lib/woo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, gender, encryptedEmail } = body || {};

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone number are required" },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
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
    } catch (error) {
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

    // Split name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Prepare update payload
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

    // Add gender to meta_data if provided
    if (gender) {
      updatePayload.meta_data = [
        {
          key: "gender",
          value: gender,
        },
      ];
    }

    // Update customer with all details
    await updateCustomerById(customer.id, updatePayload);

    console.log("✅ Updated user profile for:", email);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (e: any) {
    console.error("signup complete error", e);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
