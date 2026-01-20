import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

  
    const WP_API =
      process.env.WORDPRESS_API_URL ||
      "https://wordpressbackend.whitemantis.ae/wp-json/custom/v1/contact";

    const wpRes = await fetch(WP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, message: wpData?.message || "WP submission failed" },
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
      from: `"White Mantis Website" <${process.env.BREVO_FROM_EMAIL}>`,
      to: process.env.BREVO_TO_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${body.full_name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phone}</p>
        <p><strong>Enquiry Type:</strong> ${body.enquiry_type}</p>
        <p><strong>Message:</strong></p>
        <p>${body.message}</p>
      `,
    });

 
    return NextResponse.json(
      { success: true, message: "Submitted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
