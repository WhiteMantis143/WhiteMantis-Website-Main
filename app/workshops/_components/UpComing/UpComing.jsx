"use client";
import React, { useEffect, useState } from "react";
import styles from "./UpComing.module.css";
import one from "./1.png";

const UpComing = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/website/workshops");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!cancelled && data && Array.isArray(data.posts)) {
          const filtered = data.posts.filter((p) => {
            const rawDate = p.workshop_date ?? p.acf?.workshop_date ?? null;
            if (!rawDate) return true;

            const s = String(rawDate)
              .replace(/(\d{1,2})(st|nd|rd|th)/gi, "$1")
              .replace(/<[^>]*>/g, "")
              .trim();
            const parsed = Date.parse(s);
            if (isNaN(parsed)) return true;
            const d = new Date(parsed);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });
          setPosts(filtered);
        }
      } catch (e) {
        console.error("UpComing load error", e);
        setHasError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").trim();
  }

  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function formatDateStr(val) {
    if (!val) return null;

    if (typeof val !== "string" && typeof val !== "number") {

      if (val && typeof val === "object") {
        if (val.date) return formatDateStr(val.date);
        if (val.value) return formatDateStr(val.value);
        if (val.rendered) return formatDateStr(val.rendered);
      }
      return null;
    }

    const s = String(val).trim();

    const parsed = Date.parse(s);
    if (isNaN(parsed)) {
      return s;
    }
    const d = new Date(parsed);
    const month = d.toLocaleString(undefined, { month: "long" });
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${getOrdinal(day)}, ${year}`;
  }

  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(item) {
    setModalItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalItem(null);
  }

  function truncate(str, max) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "..." : str;
  }

  function renderCard(item, key, full = false) {
    const imgSrc =
      item?.featuredImage || item?.acf?.image?.url || (one && (one.src || one));
    const rawDate = item?.workshop_date || item?.acf?.workshop_date || null;
    const dateText = formatDateStr(rawDate) || "";
    const timeText = item?.workshop_time || item?.acf?.workshop_time || "";
    const title = item?.title || "";
    const fullExcerpt =
      stripHtml(item?.excerpt || item?.content) ||
      "Discover the complete journey of coffee — from the farm to your cup.";
    const excerpt = full ? fullExcerpt : truncate(fullExcerpt, 100);
    const bookLink =
      item?.workshopLink || item?.acf?.workshop_redirect || item?.link || null;

    return (
      <div className={styles.WorkShopCard} key={key}>
        <div className={styles.WorkShopCardTop}>
          <div className={styles.WorkShopImage}>
            <img src={imgSrc} alt={title || "workshop image"} />
          </div>
          <div className={styles.WorkShopTimeLine}>
            <div className={styles.WorkShopTimeLineLeft}>
              <svg
                width="15"
                height="17"
                viewBox="0 0 15 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3333 1.66667H12.5V0H10.8333V1.66667H4.16667V0H2.5V1.66667H1.66667C0.741667 1.66667 0.00833333 2.41667 0.00833333 3.33333L0 15C0 15.9167 0.741667 16.6667 1.66667 16.6667H13.3333C14.25 16.6667 15 15.9167 15 15V3.33333C15 2.41667 14.25 1.66667 13.3333 1.66667ZM13.3333 15H1.66667V6.66667H13.3333V15ZM5 10H3.33333V8.33333H5V10ZM8.33333 10H6.66667V8.33333H8.33333V10ZM11.6667 10H10V8.33333H11.6667V10ZM5 13.3333H3.33333V11.6667H5V13.3333ZM8.33333 13.3333H6.66667V11.6667H8.33333V13.3333ZM11.6667 13.3333H10V11.6667H11.6667V13.3333Z"
                  fill="#525252"
                />
              </svg>
              <p>{dateText}</p>
            </div>
            <div className={styles.WorkShopTimeLineRight}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.4925 0C3.3525 0 0 3.36 0 7.5C0 11.64 3.3525 15 7.4925 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.4925 0ZM7.5 13.5C4.185 13.5 1.5 10.815 1.5 7.5C1.5 4.185 4.185 1.5 7.5 1.5C10.815 1.5 13.5 4.185 13.5 7.5C13.5 10.815 10.815 13.5 7.5 13.5Z"
                  fill="#525252"
                />
                <path
                  d="M7.875 3.75H6.75V8.25L10.6875 10.6125L11.25 9.69L7.875 7.6875V3.75Z"
                  fill="#525252"
                />
              </svg>
              <p>{timeText}</p>
            </div>
          </div>
          <div className={styles.line}></div>
        </div>
        <div className={styles.WorkShopCardBottom}>
          <div className={styles.WorkShopCardBottomTop}>
            <h2>{(full ? title : truncate(title, 28)).toUpperCase()}</h2>
            {bookLink ? (
              <button

                className={styles.Button}
                onClick={() => window.open(bookLink, "_blank")}
              >
                Book Now
              </button>
            ) : (
              <button className={styles.Button}>Book Now</button>
            )}
          </div>
          <div className={styles.WorkShopCardBottomBottom}>
            <p>{excerpt}</p>
            {!full && fullExcerpt && fullExcerpt.length > 100 ? (
              <div>
                <button
                  onClick={() => openModal(item)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6C7A5F",
                    cursor: "pointer",
                    padding: 0,
                    marginTop: 8,
                  }}
                >
                  Read more
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const midpoint = Math.ceil(posts.length / 2) || 0;
  function chunkArray(arr, size = 6) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  const chunks = posts && posts.length ? chunkArray(posts, 6) : [];
  const [visibleChunks, setVisibleChunks] = useState(1);

  useEffect(() => {
    setVisibleChunks(1);
  }, [posts]);

  return (
    <>
      <div id="upcoming-workshops" className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.TopHeading}>
            <h3>Upcoming Workshops</h3>
          </div>

          <div className={styles.WorkShopContainer}>
            {loading ? (
              <div style={{ width: "100%", textAlign: "center", padding: 40 }}>
                Loading workshops…
              </div>
            ) : posts.length === 0 ? (
              <div style={{ width: "100%", textAlign: "center", padding: 80 }}>
                No workshops available right now
              </div>
            ) : (

              chunks.slice(0, visibleChunks).map((chunk, chunkIndex) => (
                <div
                  key={`chunk-${chunkIndex}`}
                  className={
                    chunkIndex === 0
                      ? styles.WorkShopContainerTop
                      : styles.WorkShopContainerBottom
                  }
                >
                  {chunk.map((p, idx) =>
                    renderCard(p, `c${chunkIndex}-${idx}`)
                  )}
                </div>
              ))
            )}
          </div>
          {modalOpen && modalItem ? (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 20,
              }}
              onClick={(e) => {

                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <div
                style={{
                  maxWidth: 450,
                  width: "100%",
                  background: "#fff",
                  padding: 20,
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#333",
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {renderCard(modalItem, "modal-card", true)}
              </div>
            </div>
          ) : null}

          <div className={styles.BottomContainer}>
            {chunks.length > visibleChunks ? (
              <button
                onClick={() =>
                  setVisibleChunks((v) => Math.min(chunks.length, v + 1))
                }
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                }}
                aria-label="View more workshops"
              >
                <span>View more</span>
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
                  <path
                    d="M9.1264 5.58542V13.9219M9.1264 13.9219L5.375 10.1705M9.1264 13.9219L12.8778 10.1705"
                    stroke="white"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpComing;
