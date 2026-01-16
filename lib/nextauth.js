import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import env from "./env";
import {
  syncCustomerToWoo,
  findCustomerByEmail,
  updateCustomerById,
  uploadImageFromUrl,
} from "./woo";

export function generatePassword(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let out = "";
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const authOptions = {
  providers: [
    // =====================================================
    // CREDENTIALS PROVIDER (OTP LOGIN)
    // =====================================================
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email;

        // ✅ SPECIAL CASE: OTP-verified users (JWT token)
        if (credentials.password.startsWith("eyJ")) {
          console.log("🔐 OTP-verified user, creating session with JWT");

          let wooCustomer = null;
          try {
            wooCustomer = await syncCustomerToWoo(email, email.split("@")[0]);
          } catch (e) {
            console.warn("Failed to sync customer", e);
          }

          return {
            id: email,
            name: email.split("@")[0],
            email: email,
            wpCustomerId: wooCustomer?.id,
          };
        }

        // 1️⃣ Check if Woo customer exists
        let existingCustomer = null;
        try {
          existingCustomer = await findCustomerByEmail(email);
        } catch (e) {
          console.warn("findCustomerByEmail failed", e);
        }

        // 2️⃣ Authenticate via WP JWT or internal API
        let res;
        try {
          if (env.WP_JWT_URL) {
            res = await fetch(env.WP_JWT_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify({
                username: credentials.email,
                password: credentials.password,
              }),
            });
          } else {
            const internalUrl = `${env.NEXTAUTH_URL.replace(
              /\/$/,
              ""
            )}/api/auth/login`;

            res = await fetch(internalUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify({
                username: credentials.email,
                password: credentials.password,
              }),
            });
          }
        } catch (e) {
          console.error("authorize fetch error", e);
          return null;
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          if (errBody?.message) throw new Error(errBody.message);
          return null;
        }

        const data = await res.json();

        const normalizedEmail = data.user_email || data.email || email;
        let name =
          data.user_display_name ||
          data.user?.name ||
          normalizedEmail.split("@")[0];

        // 3️⃣ Sync customer to WooCommerce
        const wooCustomer = await syncCustomerToWoo(normalizedEmail, name);

        return {
          id: normalizedEmail,
          name,
          email: normalizedEmail,
          wpCustomerId: wooCustomer?.id,
          profile_image: wooCustomer?.meta_data?.find((m) => m.key === "profile_image")?.value || null,
        };
      },
    }),

    // =====================================================
    // GOOGLE PROVIDER (OAuth LOGIN)
    // =====================================================
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    // =====================================================
    // SIGN IN CALLBACK (NO BLOCKING CONDITIONS)
    // =====================================================
    async signIn({ user, account, profile }) {
      try {
        if (!user?.email) return true;

        const email = user.email;
        const name = user.name || profile?.name || email.split("@")[0];

        const wooCustomer = await syncCustomerToWoo(email, name);
        user.wpCustomerId = wooCustomer?.id;

        // 🔑 OAuth Provider Logic (Only for Google/Other OAuth)
        if (account?.provider && account.provider !== "credentials" && wooCustomer?.id) {
          try {
            const provider = account.provider;

            let existingCustomer = null;
            try {
              existingCustomer = await findCustomerByEmail(email);
            } catch (e) {
              console.warn("Failed to fetch existing customer", e);
            }

            // --- 1. Social Login Metadata ---
            let shouldSetSocialMeta = true;
            if (existingCustomer?.meta_data) {
              const socialLoginMeta = existingCustomer.meta_data.find(
                (m) => m.key === "social_login"
              );
              const providerMeta = existingCustomer.meta_data.find(
                (m) => m.key === "social_login_provider"
              );

              if (socialLoginMeta !== undefined || providerMeta !== undefined) {
                shouldSetSocialMeta = false;
                console.log("📋 Account has existing metadata, preserving it");
              }
            }

            if (shouldSetSocialMeta) {
              await updateCustomerById(wooCustomer.id, {
                meta_data: [
                  { key: "social_login", value: true },
                  { key: "social_login_provider", value: provider },
                ],
              });
              console.log(`🆕 New ${provider} account - metadata set`);
            }

            // --- 2. Profile Image Sync (New) ---
            // If user has an image from Google/Provider AND doesn't have one in WC yet
            if (user.image && wooCustomer.id) {
              // Reload customer to get latest meta if needed, though we have 'existingCustomer' above, 
              // it might be stale if we just synced. Let's use existingCustomer or fetch if null.
              const currentCustomer = existingCustomer || await findCustomerByEmail(email);

              const hasProfileImage = currentCustomer?.meta_data?.some(
                (m) => m.key === "profile_image"
              );

              if (!hasProfileImage) {
                console.log("🖼️ No profile image found in WC. Uploading from provider...");
                const uploadedImage = await uploadImageFromUrl(user.image);

                if (uploadedImage) {
                  await updateCustomerById(wooCustomer.id, {
                    meta_data: [
                      { key: "profile_image", value: uploadedImage }
                    ]
                  });
                  user.profile_image = uploadedImage;
                  console.log("✅ Profile image synced to WooCommerce");
                }
              } else {
                console.log("🖼️ Profile image already exists in WC. Skipping.");
                user.profile_image = currentCustomer?.meta_data?.find((m) => m.key === "profile_image")?.value;
              }
            }

            console.log("📋 OAuth login complete. JWT fetched client-side.");
          } catch (e) {
            console.warn(`OAuth (${account.provider}) meta update failed`, e);
          }
        }

        return true;
      } catch (e) {
        console.error("signIn error", e);
        throw e;
      }
    },

    // =====================================================
    // JWT CALLBACK (SESSION STORAGE)
    // =====================================================
    async jwt({ token, user }) {
      if (user) {
        if (user.wpCustomerId) token.wpCustomerId = user.wpCustomerId;
        if (user.wpJwtToken) token.wpJwtToken = user.wpJwtToken;
        if (user.profile_image) token.profile_image = user.profile_image;
        token.name = user.name || token.name;
        token.email = user.email || token.email;
      }
      return token;
    },

    // =====================================================
    // SESSION CALLBACK (SEND TO CLIENT)
    // =====================================================
    async session({ session, token }) {
      if (!session.user) session.user = {};

      session.user.wpCustomerId = token.wpCustomerId;
      session.user.wpJwtToken = token.wpJwtToken;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.profile_image = token.profile_image;

      return session;
    },
  },
};
