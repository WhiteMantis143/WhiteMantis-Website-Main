"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Image from "next/image";


export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/website/subscription");
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setSubscriptions(data.data);
      } else {
        console.error("Failed to load subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      console.error("ErrorMessage");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dubai",
    });
  };

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  );

  const pastSubscriptions = subscriptions.filter(
    (s) => s.status === "cancelled" || s.status === "expired" || s.status === "on-hold"
  );

  if (loading) {
    return <div className={styles.Main}><div className={styles.MainContainer}><p style={{ padding: 20, textAlign: "center" }}>Loading subscriptions...</p></div></div>;
  }

  return (
    <div className={styles.Main}>
      <div className={styles.MainContainer}>
        <div className={styles.ActiveSubscriptions}>
          <div className={styles.ActiveTop}>
            <h3>Active Subscriptions</h3>
          </div>
          {activeSubscriptions.length === 0 ? (
            <div className={styles.EmptyState}>
              <p className={styles.EmptyTitle}>
                You don’t have any active subscriptions yet
              </p>
              <p className={styles.EmptySubText}>
                Explore our products and start your first subscription.
              </p>

              <Link href="/subscription" className={styles.EmptyCTA}>
                Explore products
              </Link>
            </div>
          ) : (
            activeSubscriptions.map((sub) => (
              <div key={sub.id} className={styles.ActiveList}>
                <div className={styles.ActiveListTop}>
                  <div className={styles.ActiveListTopLeft}>
                    <div className={styles.ActiveListTopLeftTop}>
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_3225_19864"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="25"
                          height="25"
                        >
                          <rect
                            width="24.0937"
                            height="24.0937"
                            fill="#D9D9D9"
                          />
                        </mask>
                        <g mask="url(#mask0_3225_19864)">
                          <path
                            d="M5.32653 21.5805C4.81939 21.5805 4.39014 21.4048 4.03877 21.0535C3.6874 20.7021 3.51172 20.2728 3.51172 19.7657V6.32894C3.51172 5.8218 3.6874 5.39255 4.03877 5.04118C4.39014 4.68982 4.81939 4.51413 5.32653 4.51413H6.71643V2.39062H8.26094V4.51413H15.8675V2.39062H17.3734V4.51413H18.7633C19.2704 4.51413 19.6997 4.68982 20.0511 5.04118C20.4024 5.39255 20.5781 5.8218 20.5781 6.32894V12.1978H19.0722V10.3446H5.01758V19.7657C5.01758 19.843 5.04978 19.9138 5.1142 19.978C5.17845 20.0424 5.24923 20.0747 5.32653 20.0747H12.1897V21.5805H5.32653ZM19.0722 23.9359C17.9281 23.9359 16.921 23.5842 16.051 22.8808C15.1809 22.1774 14.6159 21.2935 14.3559 20.229H15.603C15.8463 20.9717 16.2797 21.5757 16.9033 22.0411C17.5269 22.5062 18.2499 22.7388 19.0722 22.7388C20.0877 22.7388 20.9529 22.3813 21.6678 21.6663C22.3828 20.9514 22.7403 20.0862 22.7403 19.0708C22.7403 18.0553 22.3828 17.1901 21.6678 16.4752C20.9529 15.7602 20.0877 15.4027 19.0722 15.4027C18.5226 15.4027 18.0033 15.5211 17.5142 15.7579C17.0251 15.9946 16.5991 16.3138 16.2362 16.7153H17.914V17.9125H14.2071V14.2056H15.4042V15.8487C15.8687 15.3556 16.4183 14.9585 17.0529 14.6573C17.6874 14.3562 18.3605 14.2056 19.0722 14.2056C20.416 14.2056 21.5628 14.6805 22.5126 15.6304C23.4625 16.5802 23.9374 17.727 23.9374 19.0708C23.9374 20.4145 23.4625 21.5613 22.5126 22.5111C21.5628 23.461 20.416 23.9359 19.0722 23.9359ZM5.01758 8.83871H19.0722V6.32894C19.0722 6.25164 19.04 6.18087 18.9756 6.11662C18.9114 6.0522 18.8406 6.01999 18.7633 6.01999H5.32653C5.24923 6.01999 5.17845 6.0522 5.1142 6.11662C5.04978 6.18087 5.01758 6.25164 5.01758 6.32894V8.83871Z"
                            fill="white"
                          />
                        </g>
                      </svg>

                      <p>Active</p>
                    </div>

                    <div className={styles.ActiveListTopNextDevelivery}>
                      <p>Next Payment: </p>
                      <h4>{formatDate(sub.next_payment_date_gmt)}</h4>
                    </div>
                  </div>

                  <div className={`${styles.ActiveListTopRight} ${styles.DesktopOnly}`}>
                    <div className={styles.ActiveOrderDate}>
                      <p>Start Date:</p>
                      <p>{formatDate(sub.start_date_gmt)}</p>
                    </div>
                    <div className={styles.ActiveSubId}>
                      <p>Subscription ID:</p>
                      <p>#{sub.id}</p>
                    </div>
                  </div>

                </div>

                <div className={styles.ActiveListBottom}>
                  <div className={styles.ActiveListBottomtOP}>
                    <div className={styles.ActiveSubLeft}>
                      <div className={styles.ActiveSubLeftTop}>
                        <p>{sub.line_items?.[0]?.name || "Subscription Product"}</p>
                      </div>

                      <div className={styles.ActiveSubLeftBottom}>
                        <div className={styles.ProdImge}>
                          <Image src={sub.line_items?.[0]?.image?.src || "https://placehold.co/100x100"} alt="product image" width={80} height={80} style={{ objectFit: "cover" }} />
                        </div>

                        <div className={styles.ProdDetails}>
                          <div className={styles.ProdTitle}>
                            <h3>{sub.line_items?.[0]?.name}</h3>
                          </div>

                          <div className={styles.ProdTooDetails}>
                            <div className={styles.prodweight}>
                              <p>{sub.line_items?.[0]?.meta_data?.find(m => m.key === "pa_weight")?.value || "N/A"}</p>
                            </div>
                            <div className={styles.smallLine}>|</div>
                            <div className={styles.prodQty}>
                              <p>Qty: {sub.line_items?.[0]?.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.ActiveSubRight}>
                      <div className={styles.iocn}>
                        <svg
                          width="21"
                          height="15"
                          viewBox="0 0 21 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.43284 15C3.66344 15 3.01025 14.728 2.47328 14.1841C1.93631 13.6402 1.66783 12.9799 1.66783 12.203H0V1.80082C0 1.29759 0.172475 0.871644 0.517423 0.522987C0.862372 0.174329 1.2837 0 1.78141 0H15.2004V3.79315H17.8159L21 8.10355V12.203H19.2186C19.2186 12.9799 18.9493 13.6402 18.4107 14.1841C17.8722 14.728 17.2184 15 16.4491 15C15.6799 15 15.0267 14.728 14.4896 14.1841C13.9526 13.6402 13.6841 12.9799 13.6841 12.203H7.20204C7.20204 12.982 6.93282 13.6429 6.39437 14.1856C5.85592 14.7285 5.20208 15 4.43284 15ZM4.43506 13.5058C4.79643 13.5058 5.10155 13.3799 5.3504 13.1282C5.59926 12.8767 5.72369 12.5683 5.72369 12.203C5.72369 11.8378 5.59926 11.5293 5.3504 11.2776C5.10155 11.0261 4.79643 10.9003 4.43506 10.9003C4.07368 10.9003 3.76848 11.0261 3.51946 11.2776C3.27061 11.5293 3.14618 11.8378 3.14618 12.203C3.14618 12.5683 3.27061 12.8767 3.51946 13.1282C3.76848 13.3799 4.07368 13.5058 4.43506 13.5058ZM1.47835 10.7088H2.19092C2.40068 10.3397 2.70358 10.0303 3.09961 9.7806C3.49581 9.53089 3.94096 9.40604 4.43506 9.40604C4.91634 9.40604 5.35821 9.52931 5.76065 9.77586C6.16309 10.0224 6.46919 10.3334 6.67895 10.7088H13.7221V1.49425H1.78141C1.70569 1.49425 1.63621 1.52621 1.57297 1.59013C1.50989 1.65388 1.47835 1.72411 1.47835 1.80082V10.7088ZM16.4514 13.5058C16.8127 13.5058 17.1178 13.3799 17.3667 13.1282C17.6157 12.8767 17.7402 12.5683 17.7402 12.203C17.7402 11.8378 17.6157 11.5293 17.3667 11.2776C17.1178 11.0261 16.8127 10.9003 16.4514 10.9003C16.09 10.9003 15.7848 11.0261 15.5358 11.2776C15.2869 11.5293 15.1625 11.8378 15.1625 12.203C15.1625 12.5683 15.2869 12.8767 15.5358 13.1282C15.7848 13.3799 16.09 13.5058 16.4514 13.5058ZM15.2004 8.71644H19.6165L17.0577 5.28739H15.2004V8.71644Z"
                            fill="#2F362A"
                          />
                        </svg>
                      </div>

                      <div className={styles.AtciveSubDeliveryTiming}>
                        <p>Delivers Every {sub.billing_interval} {sub.billing_period}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.ViewCta}>
                    <Link
                      href={`/account/subscription/${sub.id}`}
                      className={styles.view}
                    >
                      View Subscription
                    </Link>
                  </div>
                  <div className={`${styles.ActiveMobileMeta} ${styles.MobileOnly}`}>
                    <div className={styles.MobileMetaRow}>
                      <span>Order Date:</span>
                      <span>{formatDate(sub.date_created)}</span>
                    </div>
                    <div className={styles.MobileMetaRow}>
                      <span>Subscription ID:</span>
                      <span>{sub.id}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.PastSubscriptions}>
          <div className={styles.PastSubscriptionsTop}>
            <h3>Past Subscriptions</h3>
          </div>

          {pastSubscriptions.length === 0 ? (
            <div className={styles.EmptyState}>
              <p className={styles.EmptyTitle}>No past subscriptions found</p>
              <p className={styles.EmptySubText}>
                Once a subscription is cancelled, it will appear here.
              </p>
            </div>
          ) : (
            pastSubscriptions.map((sub) => (
              <div key={sub.id} className={styles.PastList}>
                <div className={styles.pastListTop}>
                  <div className={styles.pastTopLeft}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="9" cy="9" r="8" stroke="#2F362A" />
                      <path
                        d="M6 6L12 12M12 6L6 12"
                        stroke="#2F362A"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <div>
                      <p>{sub.status} Subscription</p>
                      <p>on {formatDate(sub.date_modified)}</p>
                    </div>
                  </div>

                  <div className={`${styles.pastTopRight} ${styles.DesktopOnly}`}>
                    <p>Last delivery&nbsp;&nbsp;{formatDate(sub.last_payment_date_gmt || sub.date_created)}</p>
                    <p>Order ID:&nbsp;&nbsp;#{sub.number}</p>
                  </div>
                </div>

                <div className={styles.PastListBottom}>
                  <div className={styles.PastListBottomLeft}>
                    <div className={styles.pastProdImage}>
                      <Image src={sub.line_items?.[0]?.image?.src || "https://placehold.co/100x100"} alt="product image" width={80} height={80} style={{ objectFit: "cover" }} />
                    </div>

                    <div className={styles.pastProdDetails}>
                      <div className={styles.pastProdTitle}>
                        <h4>{sub.line_items?.[0]?.name}</h4>
                      </div>

                      <div className={styles.pastProdSubTitledetails}>
                        <div className={styles.pastprodTag}>
                          <p>{sub.line_items?.[0]?.name}</p>
                        </div>

                        <div className={styles.pastprodQty}>
                          <p>{sub.line_items?.[0]?.meta_data?.find(m => m.key === "pa_weight")?.value || "N/A"}</p>
                        </div>

                        <div className={styles.smallLine}>|</div>

                        <div className={styles.pastprodQty}>
                          <p>Qty: {sub.line_items?.[0]?.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.PastListBottomRight}>
                    <Link href={`/account/subscription/${sub.id}`}>
                      Subscription Details
                    </Link>
                  </div>
                </div>
                <div className={`${styles.PastMobileMeta} ${styles.MobileOnly}`}>
                  <div className={styles.MobileDivider}></div>

                  <div className={styles.MobileMetaRow}>
                    <span>Last delivery:</span>
                    <span>{formatDate(sub.last_payment_date)}</span>
                  </div>

                  <div className={styles.MobileMetaRow}>
                    <span>Order ID:</span>
                    <span>{sub.number}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
