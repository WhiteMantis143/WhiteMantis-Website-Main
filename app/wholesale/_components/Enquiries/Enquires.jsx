"use client";

import React, { useState } from "react";
import styles from "./Enquires.module.css";
import Image from "next/image";
import one from "./1.png";
import toast from "react-hot-toast";

const Enquires = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    location: "",
    branch: "",
    website: "",
    categories: [],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentCategories = prev.categories;
      if (checked) {
        return { ...prev, categories: [...currentCategories, value] };
      } else {
        return {
          ...prev,
          categories: currentCategories.filter((cat) => cat !== value),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.businessName ||
      !formData.contactName ||
      !formData.email ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };
      if (otherCategory) {
       
      }

      const res = await fetch("/api/website/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Enquiry submitted successfully!");
        setFormData({
          businessName: "",
          contactName: "",
          email: "",
          location: "",
          branch: "",
          website: "",
          categories: [],
          message: "",
        });
        setOtherCategory("");
      } else {
        toast.error(data.message || "Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.Left}>
          <Image src={one} alt="Enquires Image" />
        </div>

        <div className={styles.Right}>
          <div className={styles.RightTop}>
            <h3>Wholesale enquiries</h3>
            <p>Submit your details and our team will contact you.</p>
          </div>

          <div className={styles.RightBottom}>
            <form className={styles.Form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name*"
                value={formData.businessName}
                onChange={handleChange}
                suppressHydrationWarning
                required
              />

              <div className={styles.TwoCol}>
                <input
                  type="text"
                  name="contactName"
                  placeholder="Contact Name*"
                  value={formData.contactName}
                  onChange={handleChange}
                  suppressHydrationWarning
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address*"
                  value={formData.email}
                  onChange={handleChange}
                  suppressHydrationWarning
                  required
                />
              </div>

              <input
                type="text"
                name="location"
                placeholder="Business location*"
                value={formData.location}
                onChange={handleChange}
                suppressHydrationWarning
                required
              />
              <input
                type="text"
                name="branch"
                placeholder="Branch (if any)"
                value={formData.branch}
                onChange={handleChange}
                suppressHydrationWarning
              />
              <input
                type="text"
                name="website"
                placeholder="Website/Instagram"
                value={formData.website}
                onChange={handleChange}
              />

              <div className={styles.CheckboxBlock}>
                <p>
                  Which category best describes your business? Select all which
                  apply
                </p>

                <label>
                  <input
                    type="checkbox"
                    value="Office"
                    checked={formData.categories.includes("Office")}
                    onChange={handleCategoryChange}
                  />{" "}
                  Office
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Bakery"
                    checked={formData.categories.includes("Bakery")}
                    onChange={handleCategoryChange}
                  />{" "}
                  Bakery
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Coffee Shop"
                    checked={formData.categories.includes("Coffee Shop")}
                    onChange={handleCategoryChange}
                  />{" "}
                  Coffee Shop
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Restaurant"
                    checked={formData.categories.includes("Restaurant")}
                    onChange={handleCategoryChange}
                  />{" "}
                  Restaurant
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Other"
                    checked={formData.categories.includes("Other")}
                    onChange={handleCategoryChange}
                  />{" "}
                  Other (Specify below)
                </label>
              </div>

              <textarea
                name="message"
                placeholder="Tell us a bit more about your business and how can we help you."
                rows={4}
                className={styles.Textarea}
                value={formData.message}
                onChange={handleChange}
              />
              <div className={styles.SubButton}>
                <button
                  type="submit"
                  className={styles.SubmitButton}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enquires;
