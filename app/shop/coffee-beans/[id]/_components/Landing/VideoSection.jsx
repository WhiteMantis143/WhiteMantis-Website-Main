"use client";
import React, { useState, useEffect } from "react";
import styles from "./VideoSection.module.css";

const VideoSection = ({ product }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("product", product);

  useEffect(() => {
    const fetchMedia = async () => {
      // Check if we have a video ID
      if (!product?.videoId) {
        console.log("No video ID provided");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/website/media/${product.videoId}`);

        if (!response.ok) {
          console.error("Failed to fetch media:", response.statusText);
          return;
        }

        const mediaData = await response.json();

        // Set the video URL from the media source
        if (mediaData?.source_url) {
          setVideoUrl(mediaData.source_url);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [product?.videoId]);

  return (
    <section className={styles.banner}>
      {videoUrl && (
        <video
          className={styles.bgVideo}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      <div className={styles.overlay} />

      <div className={styles.content}>
        <h3 className={styles.title}>
          {product?.title || ""}
        </h3>
        <p className={styles.text}>
          {product?.description || ""}
        </p>
      </div>
    </section>
  );
};

export default VideoSection;
