"use client";
import styles from "./page.module.css";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Logo from "./logo.png";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Handle Google OAuth callback
  useEffect(() => {
    async function handleGoogleCallback() {
      if (status === "authenticated" && session?.user?.email) {
        const isFromGoogle =
          searchParams.get("from") === "google" ||
          window.location.href.includes("callbackUrl");

        if (!isFromGoogle) return;

        setLoading(true);

        try {
          const jwtRes = await fetch("/api/website/auth/jwt/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
            }),
          });

          const jwtData = await jwtRes.json();

          if (!jwtRes.ok) {
            throw new Error(jwtData.error || "Social login failed");
          }

          router.push("/");
        } catch (e) {
          setError(e.message || "Failed to complete sign-in");
          setLoading(false);
        }
      }
    }

    handleGoogleCallback();
  }, [status, session, searchParams, router]);

  async function handleContinue(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      // STEP 1: Validate email and check user status
      const signupRes = await fetch("/api/website/auth/user-auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const signupJson = await signupRes.json();

      // Check if signup route failed
      if (!signupRes.ok || signupJson.success === false) {
        setError(signupJson.message || "Email validation failed");
        setLoading(false);
        return;
      }

      // STEP 2: Only proceed to send OTP if Step 1 was successful
      const otpRes = await fetch("/api/website/auth/otp/send", {
        method: "POST",
      });

      const otpJson = await otpRes.json();

      // Check if OTP send failed
      if (!otpRes.ok || otpJson.success === false) {
        setError(otpJson.message || "Failed to send OTP");
        setLoading(false);
        return;
      }

      // STEP 3: Navigate to OTP page only after both steps succeed
      router.push("/auth/verify");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    signIn("google", {
      callbackUrl: "/auth?from=google",
    });
  }

  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainCoantiner}>
          <div className={styles.LeftCoantiner}>
            <h4>Pure Craft. Uncompromising Quality.</h4>
            <p>
              Dedicated to the master transformation of green coffee into
              world-class specialty beans for you
            </p>
          </div>
          <div className={styles.RightCoantiner}>
            <div className={styles.RightTop}>
              <div className={styles.RightTopOne}>
                <div className={styles.RightTopOneTop}>
                  <Image src={Logo} alt="White Mantis Logo" />
                </div>
                <div className={styles.RightTopOneBottom}>
                  <div className={styles.RightTopOneBottomTop}>
                    <h3>Login / SIGN UP</h3>
                    <p>
                      We'll send a one-time password (OTP) to this email address
                      to securely verify your account.
                    </p>
                  </div>
                  <div className={styles.RightTopOneBottomBottom}>
                    {error && (
                      <p className={styles.errorMessage}>
                        {error}
                      </p>
                    )}
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={styles.inputemail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>
              <div className={styles.RightTopTwo}>
                <p>
                  By continuing, you agree to our{" "}
                  <span className={styles.Tnc}>Terms & Privacy Policy</span>
                </p>
                <button
                  className={styles.ctacontinue}
                  onClick={handleContinue}
                  disabled={loading || !email}
                >
                  {loading ? "Processing..." : "Continue"}
                </button>
              </div>
            </div>
            <div className={styles.RightBottom}>
              <div className={styles.RightBottomOne}>
                <div className={styles.line}></div>
                <div className={styles.textor}>
                  <p>or continue with</p>
                </div>
                <div className={styles.line}></div>
              </div>
              <div className={styles.socials}>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    padding: 0,
                  }}
                  aria-label="Sign in with Google"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_3069_17144)">
                      <path
                        d="M23.9995 12.0386C23.9995 11.0554 23.9178 10.3378 23.7411 9.59375H12.25V14.0317H18.995C18.8591 15.1346 18.1248 16.7956 16.4928 17.9117L16.47 18.0603L20.1032 20.8105L20.355 20.835C22.6667 18.7488 23.9995 15.6794 23.9995 12.0386Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12.2383 23.9139C15.5428 23.9139 18.3169 22.8508 20.3432 21.0172L16.4811 18.0939C15.4476 18.7981 14.0605 19.2898 12.2383 19.2898C9.00175 19.2898 6.25478 17.2037 5.27556 14.3203L5.13203 14.3322L1.35409 17.189L1.30469 17.3232C3.31731 21.2297 7.45141 23.9139 12.2383 23.9139Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.27634 14.3228C5.01797 13.5787 4.86844 12.7814 4.86844 11.9576C4.86844 11.1338 5.01797 10.3365 5.26275 9.59244L5.25591 9.43397L1.43062 6.53125L1.30547 6.58942C0.475969 8.21052 0 10.0309 0 11.9576C0 13.8843 0.475969 15.7047 1.30547 17.3258L5.27634 14.3228Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.2383 4.62403C14.5365 4.62403 16.0867 5.59401 16.9707 6.40461L20.4248 3.10928C18.3034 1.1826 15.5428 0 12.2383 0C7.45141 0 3.31731 2.68406 1.30469 6.59056L5.26197 9.59359C6.25478 6.7102 9.00175 4.62403 12.2383 4.62403Z"
                        fill="#EB4335"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3069_17144">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
