"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ProductMain.module.css";
import Image from "next/image";
import productImg from "./1.png";
import Polygon from "./polygon.png";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
// Helper function to extract meta data value by key
const getMetaValue = (metaData, key) => {
  if (!Array.isArray(metaData)) return null;
  const meta = metaData.find((m) => m.key === key || m.key === `_${key}`);
  return meta?.value || null;
};
// Helper function to parse product groups from meta data
const getProductGroups = (product) => {
  const metaData = product?.meta_data || [];
  const productGroupsRaw = getMetaValue(metaData, "product_groups");
  let productGroups = [];
  try {
    if (typeof productGroupsRaw === "string") {
      productGroups = JSON.parse(productGroupsRaw);
    } else if (Array.isArray(productGroupsRaw)) {
      productGroups = productGroupsRaw;
    }
  } catch (e) {
    console.warn("Failed to parse product groups:", e);
  }
  // If we have product groups from meta data, use them
  if (Array.isArray(productGroups) && productGroups.length > 0) {
    const half = Math.ceil(productGroups.length / 2);
    return {
      leftDetails: productGroups.slice(0, half),
      rightDetails: productGroups.slice(half),
    };
  }
  // Fallback to default structure
  return {
    leftDetails: [
      {
        title: "Origin",
        desc: "Grown in high-altitude farms with rich volcanic soil.",
      },
      {
        title: "Processing",
        desc: "Washed and sun-dried for balanced acidity.",
      },
    ],
    rightDetails: [
      {
        title: "Roast Level",
        desc: "Medium roast for smooth flavor.",
      },
      {
        title: "Brewing",
        desc: "Perfect for pour-over and espresso.",
      },
    ],
  };
};
import { useProductImage } from "../../_context/ProductImageContext";
// ... (existing imports and helpers) ...
const ProductMain = ({ product }) => {
  const { selectedImage } = useProductImage(); // Use context
  const detailsRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const polygonRef = useRef(null);
  const middleRef = useRef(null);
  const topLeftRef = useRef(null);
  const topRightRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  // Extract meta data values
  const metaData = product?.meta_data || [];
  const tagline = getMetaValue(metaData, "tagline") || "";
  const farmDescription =
    getMetaValue(metaData, "farm_description") ||
    getMetaValue(metaData, "farm") ||
    "";
  const tastingNotesDescription =
    getMetaValue(metaData, "tasting_notes_description") ||
    getMetaValue(metaData, "tasting_notes") ||
    "";
  const varietyDescription =
    getMetaValue(metaData, "variety_description") ||
    getMetaValue(metaData, "variety") ||
    "";
  const { leftDetails, rightDetails } = React.useMemo(
    () => getProductGroups(product),
    [product]
  );

  // Use selectedImage from context, or fallback to product's first image
  const productImage = selectedImage || product?.images?.[0]?.src || productImg;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      ScrollTrigger.refresh();
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    let ctx;

    const init = async () => {
      // const { gsap } = await import("gsap");
      // const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      // const isMobile = window.innerWidth <= 640; // Removed local declaration

      ctx = gsap.context(() => {
        if (!detailsRef.current || !middleRef.current || !polygonRef.current)
          return;

        const leftItems = leftRef.current
          ? Array.from(leftRef.current.children)
          : [];
        const rightItems = rightRef.current
          ? Array.from(rightRef.current.children)
          : [];

        gsap.set([leftItems, rightItems], {
          autoAlpha: 0,
          y: 40,
        });

        gsap.set(polygonRef.current, {
          autoAlpha: 0,
          rotation: -45,
          y: 80,
          scale: 0.85,
        });

        gsap.set(middleRef.current, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: detailsRef.current,

            // 🔥 FIX: different start/end for mobile
            start: isMobile ? "top 65%" : "top 90%",
            end: isMobile ? "top 20%" : "top 30%",
            // markers: true,
            scrub: isMobile ? 0.6 : 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          middleRef.current,
          {
            y: () => {
              const imgRect = middleRef.current.getBoundingClientRect();
              const polyRect = polygonRef.current.getBoundingClientRect();

              const polyY = gsap.getProperty(polygonRef.current, "y");

              const imgCenter = imgRect.top + imgRect.height / 2;
              const polyCenter = polyRect.top + polyRect.height / 2 - polyY;

              return polyCenter - imgCenter;
            },
            scale: isMobile ? 0.6 : 0.95,
            ease: "none",
          },
          0
        );

        tl.to(
          polygonRef.current,
          {
            autoAlpha: 1,
            rotation: 0,
            y: 0,
            scale: 1,
            ease: "power3.out",
          },
          0
        );

        tl.to(
          leftItems,
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.1
        );

        tl.to(
          rightItems,
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.1
        );

        tl.to(
          [topLeftRef.current, topRightRef.current],
          {
            autoAlpha: 0,
            y: -30,
            ease: "power2.out",
          },
          0
        );
      }, detailsRef);
    };

    init();

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    return () => ctx && ctx.revert();
  }, [isMobile]);
  return (
    <div className={styles.main}>
      <div className={styles.MainConatiner}>
        <div className={styles.Top}>
          <div className={styles.left} ref={topLeftRef}>
            <div className={styles.LeftTop}>
              <h1>{product?.name || "Product Name"}</h1>
              <h3>{tagline}</h3>
            </div>
            <div className={styles.LeftBottom}>
              {farmDescription && (
                <div>
                  <h4>Farm</h4>
                  <p>{farmDescription}</p>
                </div>
              )}
              {tastingNotesDescription && (
                <div>
                  <h4>Tasting Notes</h4>
                  <p>{tastingNotesDescription}</p>
                </div>
              )}
              {varietyDescription && (
                <div>
                  <h4>Variety</h4>
                  <p>{varietyDescription}</p>
                </div>
              )}
            </div>
          </div>
          <div className={styles.Middle} ref={middleRef}>
            <Image src={productImage} alt="Product" width={500} height={500} />
          </div>
          <div className={styles.Right} ref={topRightRef}>
            <div
              dangerouslySetInnerHTML={{ __html: product?.description || "" }}
            />
          </div>
        </div>
        <div className={styles.DetailsSection} ref={detailsRef}>
          <div className={styles.DetailsLeft} ref={leftRef}>
            {leftDetails.map((item, i) => (
              <div key={i}>
                <h4>{item.title}</h4>
                <p>{item.description || item.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.DetailsCenter} ref={polygonRef}>
            <Image src={Polygon} alt="Polygon" />
          </div>
          <div className={styles.DetailsRight} ref={rightRef}>
            {rightDetails.map((item, i) => (
              <div key={i}>
                <h4>{item.title}</h4>
                <p>{item.description || item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductMain;
