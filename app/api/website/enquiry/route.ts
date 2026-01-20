import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

  
    const WP_API =
      process.env.WP_WHOLESALE_API_URL ??
      "https://wordpressbackend.whitemantis.ae/wp-json/custom/v1/wholesale";

    const wpRes = await fetch(WP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, message: wpData?.message || "Submission failed" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"White Mantis Wholesale" <${process.env.BREVO_FROM_EMAIL}>`,
      to: process.env.BREVO_TO_EMAIL,
      subject: "New Wholesale Enquiry",
      html: `
        <h2>New Wholesale Enquiry</h2>

        <p><strong>Business Name:</strong> ${body.businessName}</p>
        <p><strong>Contact Name:</strong> ${body.contactName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Location:</strong> ${body.location}</p>
        <p><strong>Branch:</strong> ${body.branch || "-"}</p>
        <p><strong>Website / Instagram:</strong> ${body.website || "-"}</p>

        <p><strong>Categories:</strong></p>
        <ul>
          ${(body.categories || [])
            .map((cat: string) => `<li>${cat}</li>`)
            .join("")}
        </ul>

        <p><strong>Message:</strong></p>
        <p>${body.message || "-"}</p>
      `,
    });


    return NextResponse.json(
      {
        success: true,
        message: "Wholesale enquiry submitted successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Wholesale API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
