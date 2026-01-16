"use client";

import React, { useEffect, useState } from "react";
import styles from "./Career.module.css";

const WORD_LIMIT = 50;

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function truncateWords(text, limit) {
  if (!text) return "";
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length <= limit) return parts.join(" ");
  return parts.slice(0, limit).join(" ") + "...";
}

function findApplyLink(acf) {
  if (!acf || typeof acf !== "object") return null;

  const keys = Object.keys(acf);
  for (const k of keys) {
    const v = acf[k];
    if (typeof v === "string" && /https?:\/\//i.test(v)) {
      if (/apply|form|link/i.test(k) || /apply|form|link/i.test(v)) return v;
    }
  }

  for (const k of keys) {
    const v = acf[k];
    if (typeof v === "object") {
      const found = findApplyLink(v);
      if (found) return found;
    }
  }
  return null;
}

const CLASS_CYCLE = ["One", "Two", "Three"];

const Career = () => {
  const [posts, setPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/careers")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch((err) => {
        console.error("Failed to fetch careers:", err);
        if (mounted) setPosts([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const visible = posts.slice(0, visibleCount);
  const hasMore = posts.length > visibleCount;

  const onViewMore = () => setVisibleCount((c) => c + 3);

  return (
    <>
      <div className={styles.main}>
        <div className={styles.MainContainer}>
          <div className={styles.Top}>
            <h3>Join Our team</h3>
          </div>
          <div className={styles.Bottom}>
            <div className={styles.BottomTop}>
              {loading && (
                <>
                  <div className={styles.One}>
                    <div className={styles.oneTop}>
                      <div className={styles.Role}>
                        <h3>Loading...</h3>
                      </div>
                      <div className={styles.Desc}>
                        <p></p>
                      </div>
                      <div className={styles.Apply}>
                        <p>Apply</p>
                      </div>
                    </div>
                    <div className={styles.line}></div>
                  </div>
                </>
              )}

              {!loading &&
                visible.map((post, idx) => {
                  const cls = CLASS_CYCLE[idx % CLASS_CYCLE.length];
                  const wrapperClass = styles[cls] || styles.One;
                  const title = post.title || "";
                  const rawDesc = post.excerpt || post.content || "";
                  const descText = truncateWords(
                    stripHtml(rawDesc),
                    WORD_LIMIT
                  );

                  let applyLink = null;
                  if (
                    post.applyLink &&
                    typeof post.applyLink === "string" &&
                    /https?:\/\//i.test(post.applyLink)
                  ) {
                    applyLink = post.applyLink;
                  }

                  const acf = post.acf || {};
                  const preferredKeys = [
                    "apply_form_link",
                    "apply_link",
                    "apply",
                    "application_link",
                    "application_form_link",
                    "apply_form",
                    "apply_url",
                    "applyformlink",
                    "apply_form_link_url",
                  ];
                  for (const k of preferredKeys) {
                    const v = acf[k];
                    if (typeof v === "string" && /https?:\/\//i.test(v)) {
                      applyLink = v;
                      break;
                    }
                  }
                  if (!applyLink)
                    applyLink = findApplyLink(acf) || post.link || "#";

                  try {
                    console.debug("[Career] post", {
                      id: post.id,
                      applyLink: applyLink,
                      applyLinkSource: post.applyLinkSource ?? null,
                      hasAcf: !!post.acf,
                    });
                  } catch (e) {}

                  return (
                    <div className={wrapperClass} key={post.id}>
                      <div className={styles.oneTop}>
                        <div className={styles.Role}>
                          <h3 dangerouslySetInnerHTML={{ __html: title }} />
                        </div>
                        <div className={styles.Desc}>
                          <p>{descText}</p>
                        </div>
                        <a
                          className={styles.Apply}
                          href={applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p>View Details</p>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="19"
                              height="19"
                              fill="white"
                              stroke="#6E736A"
                            />
                            <g clip-path="url(#clip0_1524_8195)">
                              <path
                                d="M6.85103 13.2421L12.7458 7.34736M12.7458 7.34736L12.7458 12.6526M12.7458 7.34736L7.44051 7.34736"
                                stroke="#6E736A"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_1524_8195">
                                <rect
                                  width="10.0037"
                                  height="8.75181"
                                  fill="white"
                                  transform="translate(16.2656 10.1875) rotate(135)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </a>
                      </div>
                      <div className={styles.line}></div>
                    </div>
                  );
                })}
            </div>

            {!loading && posts.length > 3 && (
              <div
                className={styles.BottomBottom}
                onClick={hasMore ? onViewMore : undefined}
                role={hasMore ? "button" : undefined}
                style={{ cursor: hasMore ? "pointer" : "default" }}
              >
                <div className={styles.BottomBottomText}>
                  <p>{hasMore ? "View more" : "No more"}</p>
                </div>
                <div className={styles.BottomBottomArrow}>
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="9.3793"
                      cy="9.3793"
                      r="9.37851"
                      transform="rotate(180 9.3793 9.3793)"
                      fill="#6C7A5F"
                    />
                    <g clipPath="url(#clip0_856_4259)">
                      <path
                        d="M9.1264 5.58542V13.9219M9.1264 13.9219L5.375 10.1705M9.1264 13.9219L12.8778 10.1705"
                        stroke="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_856_4259">
                        <rect
                          width="10.0037"
                          height="10.0037"
                          fill="white"
                          transform="matrix(0 -1 1 0 4.125 14.7578)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Career;
