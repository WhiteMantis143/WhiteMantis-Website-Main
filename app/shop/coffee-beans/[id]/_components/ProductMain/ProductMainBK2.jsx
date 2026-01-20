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
  const containerRef = useRef(null);

  const leftRefDetails = useRef([]);
  const rightRefDetails = useRef([]);

  const polygonRefImage = useRef(null);

  const topRef = useRef(null);
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
    [product],
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
    // console.log("Bottom: ", polygonRef.current.getBoundingClientRect().bottom);
    let ctx;

    const init = async () => {
      // const { gsap } = await import("gsap");
      // const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      // const isMobile = window.innerWidth <= 640; // Removed local declaration

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: middleRef.current,
            startTrigger: topRef.current,
            start: () => `top ${topRef.current.getBoundingClientRect().top}px`,
            endTrigger: polygonRef.current,
            end: "center center",
            anticipatePin: 1,
            markers: true,
            pin: middleRef.current,
            scrub: true,
          },
        });

        gsap.set(leftRefDetails.current, { opacity: 0, x: 150 });
        gsap.set(rightRefDetails.current, { opacity: 0, x: -150 });
        gsap.set(detailsRef.current, { opacity: 0, y: 0 });
        gsap.set(polygonRefImage.current, {
          rotateX: -360,
          scale: 0,
          transformStyle: "preserve-3d",
          y: 200,
        });

        // Add animations to validity
        tl.to(
          rightRefDetails.current,
          {
            opacity: 1,
            x: 0,
            // duration: 1,
            // ease: "power3.inOut",
            stagger: 0.4,
          },
          "<",
        )
          .to(
            leftRefDetails.current,
            {
              opacity: 1,
              x: 0,
              // duration: 1,
              // ease: "power3.inOut",
              stagger: 0.4,
            },
            "<",
          )
          .to(
            middleRef.current,
            {
              scale: 1.2,
              // y: -50,
              // duration: 1,
              // ease: "power3.inOut",
            },
            "<",
          )
          .to(
            polygonRefImage.current,
            {
              rotateX: 0,
              // duration: 1,
              scale: 1,
              y: 0,
              // ease: "power3.inOut",
            },
            "<",
          )
          .to(
            detailsRef.current,
            {
              opacity: 1,
              y: 0,
              // duration: 1,
              // ease: "power3.inOut",
            },
            "<",
          ); // Run at same time as previous animation
      }, containerRef);
    };

    init();

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    return () => ctx && ctx.revert();
  }, [isMobile]);
  return (
    <div className={styles.main}>
      <div className={styles.MainConatiner} ref={containerRef}>
        <div className={styles.Top} ref={topRef}>
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
          <div className={styles.DetailsSection}>
            <div className={styles.DetailsLeft} ref={leftRef}>
              {leftDetails.map((item, i) => (
                <div key={i} ref={(el) => (leftRefDetails.current[i] = el)}>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.desc}</p>
                </div>
              ))}
            </div>
            <div className={styles.DetailsCenter} ref={polygonRef}>
              <Image src={Polygon} alt="Polygon" ref={polygonRefImage} />
            </div>
            <div className={styles.DetailsRight} ref={rightRef}>
              {rightDetails.map((item, i) => (
                <div key={i} ref={(el) => (rightRefDetails.current[i] = el)}>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductMain;
