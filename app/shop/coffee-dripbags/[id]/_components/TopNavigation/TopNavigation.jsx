'use client';
import React from "react";
import styles from "./TopNavigation.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TopNavigation = () => {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const categorySlug = segments[1] || "";
  const productSlug = segments[2] || "";

  const formatSlug = (slug) =>
    slug
      .replace(/-\d+$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
      const getFirstWord = (slug) => {
  const formatted = formatSlug(slug);
  return formatted.split(" ")[0];
};


  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <div className={styles.Home}>
              <Link href="/">
                <p>home</p>
              </Link>
            </div>
            <div className={styles.SeparatorSvg}>
              <svg
                width="8"
                height="13"
                viewBox="0 0 8 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.946167 12.8717L0 11.9255L5.48967 6.43583L0 0.946167L0.946167 0L7.382 6.43583L0.946167 12.8717Z"
                  fill="#6E736A"
                />
              </svg>
            </div>
            <div className={styles.Shop}>
              <Link href="/shop">
                <p>Shop</p>
              </Link>
            </div>
            <div className={styles.SeparatorSvg}>
              <svg
                width="8"
                height="13"
                viewBox="0 0 8 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.946167 12.8717L0 11.9255L5.48967 6.43583L0 0.946167L0.946167 0L7.382 6.43583L0.946167 12.8717Z"
                  fill="#6E736A"
                />
              </svg>
            </div>
            <div className={styles.CatName}>
              <Link href={`/shop/${categorySlug}`}>
                <p>{formatSlug(categorySlug)}</p>
              </Link>
            </div>
            <div className={styles.SeparatorSvg}>
              <svg
                width="8"
                height="13"
                viewBox="0 0 8 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.946167 12.8717L0 11.9255L5.48967 6.43583L0 0.946167L0.946167 0L7.382 6.43583L0.946167 12.8717Z"
                  fill="#6E736A"
                />
              </svg>
            </div>
            <div className={styles.ProductName}>
            <p>{getFirstWord(productSlug)}</p>

            </div>
          </div>
          <div className={styles.line}></div>
        </div>
      </div>
    </>
  );
};

export default TopNavigation;
