"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
    const currentPage =
    parts[2]?.toUpperCase() ||
    parts[1]?.toUpperCase() ||
    "ACCOUNT";

  const crumbs = [
    { label: "home", href: "/" },
    { label: "Account", href: "/account" },
  ];

  const third = parts[1];
  const fourth = parts[2]; 

  if (third) {
    if (third === "orders") {
      if (fourth) {
        crumbs.push({ label: "Orders", href: "/account/orders" });
        crumbs.push({ label: `Order ${fourth}`, href: null }); // No link for current page
      } else {
        crumbs.push({ label: "Orders", href: null });
      }
    } else if (third === "subscription") {
      if (fourth) {
        crumbs.push({ label: "Subscriptions", href: "/account/subscription" });
        crumbs.push({ label: `Subscription ${fourth}`, href: null });
      } else {
        crumbs.push({ label: "Subscriptions", href: null });
      }
    } else if (third === "profile") {
      crumbs.push({ label: "Profile", href: null });
      // Add other sections here as needed
    } else {
      crumbs.push({ label: third.charAt(0).toUpperCase() + third.slice(1), href: null });
    }
  } else {

    crumbs.push({ label: "Profile", href: null });
  }

  return (
    <div className={styles.BreadcrumbWrapper}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <div className={styles.Main}>
          <div className={styles.mobileHeader}>
          <Link href="/account" className={styles.backBtn}>
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.654 11.8765L0 5.93827L5.654 0L6.70775 1.13908L2.8885 5.15053H15.404V6.72602H2.8885L6.70775 10.7375L5.654 11.8765Z"
                fill="#2F362A"
              />
            </svg>
          </Link>
          <h3>{currentPage.replace("-", " ")}</h3>
        </div>
        <div className={styles.Top}>
          {crumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id={`mask_${index}`}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="16"
                    height="16"
                  >
                    <rect width="16" height="16" fill="#D9D9D9" />
                  </mask>
                  <g mask={`url(#mask_${index})`}>
                    <path
                      d="M5.3446 14.4342L4.39844 13.488L9.8881 7.99833L4.39844 2.50867L5.3446 1.5625L11.7804 7.99833L5.3446 14.4342Z"
                      fill="#6E736A"
                    />
                  </g>
                </svg>
              )}
              {crumb.href ? (
                <Link href={crumb.href}>
                  <h4>{crumb.label}</h4>
                </Link>
              ) : (
                <h5 aria-current="page">{crumb.label}</h5>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.line}></div>
      </div>
    </nav>
    </div>
  );
}
