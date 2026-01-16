"use client";
import React, { useState } from "react";
import styles from "./ContactForm.module.css";
import testStyles from "../TestFormUi/TestFormUi.module.css";
import Image from "next/image";
import one from "./1.png";
import whatsappIcon from "./Whatsapp-icon.svg";
import Link from "next/link";

const ContactForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiryType, setEnquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseError, setResponseError] = useState(false);

const ENDPOINT = "/api/website/contact";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage("");
    setResponseError(false);


    if (!fullName.trim() || !email.trim()) {
      setResponseError(true);
      setResponseMessage("Please enter your name and email.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        enquiry_type: enquiryType.trim(),
        message: message.trim(),
      };

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || (json && json.success === false)) {
        setResponseError(true);
        setResponseMessage((json && json.message) || "Submission failed. Please try again.");
      } else {
        setResponseError(false);
        setResponseMessage("Thank you! Your message has been submitted.");
        setFullName("");
        setEmail("");
        setPhone("");
        setEnquiryType("");
        setMessage("");
      }
    } catch (err) {
      setResponseError(true);
      setResponseMessage("Network error. Please try again.");
    } finally {
        
          try {
            window.setTimeout(() => {
              setResponseMessage("");
            }, 3000);
          } catch (e) {}
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.LeftConatiner}>
            <Image
              src={one}
              alt="Contact Form Image"
              className={styles.image}
            />
          </div>

          <div className={styles.RightContainer}>
            <form onSubmit={handleSubmit} className={testStyles.MainConatiner}>
              <div className={testStyles.Top}>
                <h3>Send us a message</h3>

                <Link href="https://wa.me/+9710589535337">
                  <Image
                    src={whatsappIcon}
                    alt="Whatsapp Icon"
                    width={34}
                    height={34}
                    className={testStyles.whatsappIcon}
                  />
                </Link>
              </div>

              <div className={testStyles.formBox}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <div className={testStyles.row}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className={testStyles.selectWrap}>
                  <select
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                  >
                    <option value="">Please select enquiry type</option>
                    <option value="General">General</option>
                    <option value="Support">Support</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Careers">Careers</option>
                  </select>
                </div>

                <textarea
                  placeholder="Write your message here."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className={testStyles.Bottom}>
                <button
                  className={testStyles.btn}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>

              {responseMessage && (
                <div
                  style={{
                    color: responseError ? "crimson" : "#197B5B",
                    marginTop: 12,
                  }}
                >
                  {responseMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
