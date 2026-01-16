"use client";

import styles from "./page.module.css";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Logo from "./logo.png";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const RESEND_COOLDOWN = 60;

export default function Otp() {
  const router = useRouter();
  const inputsRef = useRef([]);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [userEmail, setUserEmail] = useState("");

  // Fetch user email on mount
  useEffect(() => {
    async function fetchEmail() {
      try {
        const emailRes = await fetch("/api/website/auth/user-auth/prefill-email");
        const emailData = await emailRes.json();
        if (emailData?.email) {
          setUserEmail(emailData.email);
        }
      } catch (e) {
        console.error("Failed to fetch email:", e);
      }
    }
    fetchEmail();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Verify OTP
  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const otpString = otp.join("");

    if (otpString.length !== 4) {
      setError("Please enter all 4 digits");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/website/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpString }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Invalid or expired OTP");
        setLoading(false);
        return;
      }

      const emailRes = await fetch("/api/website/auth/user-auth/prefill-email");
      const emailData = await emailRes.json();

      if (!emailData?.email) {
        setError("Session expired. Please start again.");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: emailData.email,
        password: json.jwt,
      });

      if (signInResult?.error) {
        console.error("NextAuth session creation failed:", signInResult.error);
      }

      if (json.isNewUser) {
        router.push("/auth/create-profile");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (e) {
      console.error("OTP verification error:", e);
      setError(e.message || "Verification failed");
      setLoading(false);
    }
  }

  // Resend OTP
  async function resendOtp() {
    if (countdown > 0) return;

    setError("");
    setInfo("");
    setResending(true);

    try {
      const res = await fetch("/api/website/auth/otp/send", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Unable to resend OTP");
        setResending(false);
        return;
      }

      setInfo("OTP sent again. Please check your email.");
      setCountdown(RESEND_COOLDOWN);
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (e) {
      setError(e.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  return (
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
                  <h3>VERIFY EMAIL</h3>

                  <div className={styles.OtpTextRow}>
                    <p>
                      Enter 4 digit code sent to{" "}
                      <span className={styles.EmailText}>
                        {userEmail || "your email"}
                      </span>
                    </p>

                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push("/auth")}
                    >
                      <path
                        d="M7.5 1.875H3.125C2.79348 1.875 2.47554 2.0067 2.24112 2.24112C2.0067 2.47554 1.875 2.79348 1.875 3.125V11.875C1.875 12.2065 2.0067 12.5245 2.24112 12.7589C2.47554 12.9933 2.79348 13.125 3.125 13.125H11.875C12.2065 13.125 12.5245 12.9933 12.7589 12.7589C12.9933 12.5245 13.125 12.2065 13.125 11.875V7.5"
                        stroke="#2F362A"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.4849 1.63833C11.7336 1.38968 12.0708 1.25 12.4224 1.25C12.7741 1.25 13.1113 1.38968 13.3599 1.63833C13.6086 1.88697 13.7482 2.22419 13.7482 2.57583C13.7482 2.92746 13.6086 3.26468 13.3599 3.51333L7.7268 9.14708C7.57839 9.29535 7.39505 9.4039 7.19367 9.4627L5.39805 9.9877C5.34427 10.0034 5.28726 10.0043 5.23299 9.99042C5.17872 9.97652 5.12919 9.94828 5.08958 9.90867C5.04996 9.86906 5.02173 9.81952 5.00782 9.76526C4.99392 9.71099 4.99486 9.65398 5.01055 9.6002L5.53555 7.80457C5.59463 7.60336 5.70338 7.42024 5.8518 7.27208L11.4849 1.63833Z"
                        stroke="#2F362A"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {error && (
                  <p className={styles.errorMessage}>
                    {error}
                  </p>
                )}

                {info && (
                  <p className={styles.infoMessage}>
                    {info}
                  </p>
                )}

                <div className={styles.OtpInputs}>
                  {[0, 1, 2, 3].map((_, index) => (
                    <input
                      key={index}
                      maxLength="1"
                      value={otp[index]}
                      ref={(el) => (inputsRef.current[index] = el)}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.RightTopTwo}>
              <button
                className={styles.ctacontinue}
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <p className={styles.ResendText}>
                Didn't receive it? Check spam or{" "}
                {countdown > 0 ? (
                  <span style={{ cursor: "not-allowed", opacity: 0.6 }}>
                    Resend OTP ({String(Math.floor(countdown / 60)).padStart(2, "0")}:
                    {String(countdown % 60).padStart(2, "0")})
                  </span>
                ) : (
                  <span onClick={resendOtp} style={{ cursor: resending ? "not-allowed" : "pointer" }}>
                    {resending ? "Resending..." : "Resend OTP"}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
