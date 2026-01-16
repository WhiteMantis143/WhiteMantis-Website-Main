"use client";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styles from "./Crafting.module.css";
import Image from "next/image";
import fallbackImage from "./1.png";

const Crafting = ({ product }) => {
  const [brewingData, setBrewingData] = useState({});
  const [active, setActive] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [videoUrl, setVideoUrl] = useState(null);

  const specsRef = useRef(null);
  const [syncedHeight, setSyncedHeight] = useState(0);

  // Parse product data and fetch media
  useEffect(() => {
    const parseProductData = async () => {
      if (!product || !product.groups || !Array.isArray(product.groups)) {
        console.log("No product groups data available");
        return;
      }

      // Transform groups data into the format the component expects
      const transformedData = {};
      const imageIds = new Set();

      product.groups.forEach((group) => {
        const key = group.title.toLowerCase().replace(/\s+/g, '_');
        transformedData[key] = {
          label: group.title,
          imageId: group.image_id,
          specs: group.items.map(item => ({
            title: item.title,
            value: item.description
          }))
        };
        if (group.image_id) {
          imageIds.add(group.image_id);
        }
      });

      setBrewingData(transformedData);

      // Set the first group as active
      const firstKey = Object.keys(transformedData)[0];
      if (firstKey) {
        setActive(firstKey);
      }

      // Fetch all images
      const fetchImages = async () => {
        const imagePromises = Array.from(imageIds).map(async (imageId) => {
          try {
            const response = await fetch(`/api/website/media/${imageId}`);
            if (response.ok) {
              const mediaData = await response.json();
              return { id: imageId, url: mediaData.source_url };
            }
          } catch (error) {
            console.error(`Error fetching image ${imageId}:`, error);
          }
          return { id: imageId, url: null };
        });

        const images = await Promise.all(imagePromises);
        const imageMap = {};
        images.forEach(({ id, url }) => {
          if (url) imageMap[id] = url;
        });
        setImageUrls(imageMap);
      };

      fetchImages();

      // Fetch video if available
      if (product.video_id) {
        try {
          const response = await fetch(`/api/website/media/${product.video_id}`);
          if (response.ok) {
            const mediaData = await response.json();
            setVideoUrl(mediaData.source_url);
          }
        } catch (error) {
          console.error("Error fetching video:", error);
        }
      }
    };

    parseProductData();
  }, [product]);

  useLayoutEffect(() => {
    if (!specsRef.current) return;

    const updateHeight = () =>
      setSyncedHeight(specsRef.current.offsetHeight);

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(specsRef.current);

    return () => observer.disconnect();
  }, [active]);

  // Return early if no data
  if (!active || !brewingData[active]) {
    return null;
  }

  const current = brewingData[active];
  const currentImageUrl = imageUrls[current.imageId] || fallbackImage;

  return (
    <div className={styles.main}>
      <div className={styles.MainContainer}>

        <div className={styles.Left}>
          <div className={styles.LeftTop}>
            <h3>{product?.title || "Brewing guide"}</h3>
          </div>

          <div className={styles.LeftBottom}>

            <div className={styles.LeftBottomFilters}>
              {Object.keys(brewingData).map((key, index) => (
                <React.Fragment key={key}>
                  <div
                    className={`${styles.FilterName} ${active === key
                      ? styles.activeFilter
                      : styles.inactiveFilter
                      }`}
                    onClick={() => setActive(key)}
                  >
                    <h4 style={{ cursor: "pointer" }}>{brewingData[key].label}</h4>
                  </div>
                  {index < Object.keys(brewingData).length - 1 && <div className={styles.Line}></div>}
                </React.Fragment>
              ))}
            </div>


            <div className={styles.LeftBottomFiltersData}>
              <div
                className={styles.LeftBottomFiltersDataImage}
                style={{ height: syncedHeight }}
              >
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.videoveer}
                  />
                ) : (
                  <Image src={fallbackImage} alt={current.label} width={500} height={500} />
                )}
              </div>

              <div
                className={styles.LeftBottomFiltersDataInfo}
                ref={specsRef}
              >
                {current.specs.map((item, i) => (
                  <div className={styles.one} key={i}>
                    <h4>{item.title}</h4>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.Right}>
          <div className={styles.RightTop}>
            <p>{product?.description || ""}</p>
          </div>

          <div
            className={styles.RightBottom}
            style={{ height: syncedHeight }}
          >
            <Image src={currentImageUrl} alt="Brewing Guide" width={500} height={500} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crafting;
