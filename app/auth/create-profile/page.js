"use client";

import styles from "./page.module.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "./logo.png";
import flag from "./2.png";
import { useRouter } from "next/navigation";

export default function CreateProfile() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch prefilled email from cookie-based API
  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch("/api/website/auth/user-auth/prefill-email", {
          method: "GET",
        });
        const data = await res.json();
        if (data?.email) {
          setEmail(data.email);
        }
      } catch (e) {
        console.error("Failed to fetch prefilled email", e);
      }
    }

    fetchEmail();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/website/auth/user-auth/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: `+971${phone}`,
          gender,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Profile update failed");
      }

      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.LeftContainer}>
          <h4>PURE CRAFT. UNCOMPROMISING QUALITY.</h4>
          <p>
            Dedicated to the master transformation of green coffee into
            world-class specialty beans for you
          </p>
        </div>

        <div className={styles.RightContainer}>
          <form className={styles.FormWrapper} onSubmit={submit}>
            <div className={styles.LogoBox}>
              <Image src={Logo} alt="White Mantis Logo" />
            </div>

            <div className={styles.Header}>
              <h3>CREATE YOUR ACCOUNT</h3>
              <p>Your specialty coffee journey begins here.</p>
            </div>

            <div className={styles.Fields}>
              {error && <p className={styles.errorMessage}>{error}</p>}

              <input
                type="email"
                placeholder="username@gmail.com"
                value={email}
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              />

              <input
                type="text"
                placeholder="Full name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />

              <div className={styles.PhoneRow}>
                <div className={styles.FlagBox}>
                  <Image src={flag} alt="UAE Flag" />
                  <span>+971</span>
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number*"
                  value={phone}
                  maxLength={10}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.SelectWrapper}>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Gender (optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>

                <svg
                  className={styles.DropArrow}
                  width="13"
                  height="7"
                  viewBox="0 0 13 7"
                  fill="none"
                >
                  <path
                    opacity="0.6"
                    d="M6.0625 6.75L0.000322705 1.88257e-07L12.1247 -8.71687e-07L6.0625 6.75Z"
                    fill="#6E736A"
                  />
                </svg>
              </div>

              <button
                className={styles.PrimaryBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
