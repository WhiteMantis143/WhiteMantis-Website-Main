import { NextResponse, NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { encrypt } from "../../../../../../lib/crypto";

const CLIENT_ID = process.env.GOOGLE_APP_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    if (!token) {
        return NextResponse.json({ success: false, message: "ID token required" }, { status: 400 });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const { sub, email, name, given_name, family_name, picture } = payload;

        let firstName = given_name || ""
        let lastName = family_name || "";

        if (!firstName) {
            const fullName = name || "User"; // Fallback to "User" if name is empty
            const firstSpaceIndex = fullName.trim().indexOf(' ');

            if (firstSpaceIndex === -1) {
                firstName = fullName;
                lastName = "";
            } else {
                firstName = fullName.substring(0, firstSpaceIndex);
                lastName = fullName.substring(firstSpaceIndex + 1).trim();
            }
        }

        const authHeader =
            "Basic " +
            Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64");

        try {
            const getRes = await fetch(
                process.env.WP_URL + "wp-json/wc/v3/customers?email=" + encodeURIComponent(email),
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": authHeader,
                    },
                }
            );

            if (!getRes.ok) throw new Error("WordPress error while fetching user");

            const users = await getRes.json();

            if (users.length === 0) {
                try {
                    const postRes = await fetch(
                        process.env.WP_URL + "wp-json/wc/v3/customers",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": authHeader,
                            },
                            body: JSON.stringify({
                                email,
                                first_name: firstName,
                                last_name: lastName,
                                username: email,
                                password: crypto.randomBytes(10).toString("hex"),
                                meta_data: [
                                    { key: "google_id", value: sub },
                                    { key: "google_picture", value: picture },
                                ],
                            }),
                        }
                    );

                    if (!postRes.ok) {
                        console.log('Error while creating user in google auth application', postRes)
                        return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: postRes.status || 500 });
                    }

                    let jwtToken
                    try {
                        const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
                            `http://localhost:${process.env.PORT || 3000}`;

                        const jwtResponse = await fetch(`${baseUrl}/api/application/auth/jwt/get`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                        });

                        jwtToken = null;
                        if (jwtResponse.ok) {
                            const jwtData = await jwtResponse.json();
                            jwtToken = jwtData.token;
                            console.log("✅ JWT token generated for:", email);
                        } else {
                            console.error("❌ Failed to generate JWT token");
                            return NextResponse.json(
                                { success: false, message: "Failed to generate authentication token" },
                                { status: 500 }
                            );
                        }
                    } catch (e) {
                        console.log('Error while fetching user in google auth application', e)
                        return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 500 });
                    }

                    const payload = {
                        email,
                        nonce: crypto.randomUUID(),
                    };

                    const encrypted = encrypt(payload);

                    return NextResponse.json(
                        {
                            success: true,
                            accountExists: false,
                            encryptedEmail: encrypted,
                            jwtToken,
                            name
                        },
                        { status: 200 }
                    );
                } catch (e) {
                    console.log('Error while creating user in google auth application', e)
                    return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 500 });
                }
            }
            else {

                let jwtToken
                try {
                    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
                        `http://localhost:${process.env.PORT || 3000}`;

                    const jwtResponse = await fetch(`${baseUrl}/api/application/auth/jwt/get`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });

                    jwtToken = null;
                    if (jwtResponse.ok) {
                        const jwtData = await jwtResponse.json();
                        jwtToken = jwtData.token;
                        console.log("✅ JWT token generated for:", email);
                    } else {
                        console.error("❌ Failed to generate JWT token");
                        return NextResponse.json(
                            { success: false, message: "Failed to generate authentication token" },
                            { status: 500 }
                        );
                    }
                } catch (e) {
                    console.log('Error while fetching user in google auth application', e)
                    return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 500 });
                }

                const payload = {
                    email,
                    nonce: crypto.randomUUID(),
                };

                const encrypted = encrypt(payload);

                return NextResponse.json(
                    {
                        success: true,
                        accountExists: true,
                        encryptedEmail: encrypted,
                        jwtToken,
                    },
                    { status: 200 }
                );
            }
        } catch (error) {
            console.log('Error while fetching user in google auth application', error)
            return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 500 });
        }
    } catch (e) {
        console.log(e)
        return NextResponse.json({ success: false, message: "Failed to authenticate user" }, { status: 500 });
    }
}
