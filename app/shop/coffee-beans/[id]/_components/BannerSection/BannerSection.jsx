"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./BannerSection.module.css";
import banner from "./1.png";
const BannerSection = ({ product }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchMedia = async () => {
      if (!product?.imageId) {
        console.log("No image ID provided");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/website/media/${product.imageId}`);
        if (!response.ok) {
          console.error("Failed to fetch media:", response.statusText);
          return;
        }
        const mediaData = await response.json();
        // Set the image URL from the media source
        if (mediaData?.source_url) {
          setImageUrl(mediaData.source_url);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
  }, [product?.imageId]);
  return (
    <section className={styles.banner}>
      <div className={styles.bgWrap}>
        <Image
          src={imageUrl || banner}
          alt="coffee farm"
          fill
          sizes="(min-width: 1200px) 100vw, 100vw"
          priority
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <h3 className={styles.title}>
            {product?.title || ""}
          </h3>
          <p className={styles.text}>
            {product?.description || ""}
          </p>
        </div>
      </div>
    </section>
  );
};
export default BannerSection;







