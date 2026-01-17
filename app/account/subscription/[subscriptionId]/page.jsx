"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";


export default function SubscriptionDetailPage({ params }) {
  // Handle params wrapping/unwrapping
  const { subscriptionId } = React.use(params);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscription();
    }
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/website/subscription/${subscriptionId}`);
      const resData = await response.json();

      if (resData.success) {
        setData(resData);
      } else {
        console.error("Subscription not found");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      console.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/website/subscription/${subscriptionId}/cancel`, {
        method: 'POST'
      });
      const resData = await response.json();

      if (resData.success) {
        console.log("Subscription cancelled successfully");
        fetchSubscription(); // Refresh data
      } else {
        console.error(resData.message || "Failed to cancel");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      console.error("An error occurred");
    } finally {
      setCancelling(false);
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

  if (loading) return <div className={styles.Container}><p style={{ textAlign: "center" }}>Loading...</p></div>;
  if (!data || !data.subscription) return <div className={styles.Container}>Subscription not found</div>;

  const { subscription: sub, stripeSubscription, paymentHistory } = data;
  const product = sub.line_items?.[0];

  return (
    <div className={styles.Container}>
      <h2 className={styles.PageTitle}>SUBSCRIPTION DETAILS</h2>

      <div className={styles.StatusBar}>
        {sub.status === "active" ? (
          <p>Subscription active since {formatDate(sub.date_created)}</p>
        ) : (
          <p>Subscription {sub.status} on {formatDate(sub.date_modified)}</p>
        )}
      </div>

      <div className={styles.Card}>
        <h3 className={styles.CardTitle}>{product?.name || "Product Name"}</h3>

        <div className={styles.ProductRow}>
          <Image
            src={product?.image?.src || "https://placehold.co/100x100"}
            alt="product"
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
          />

          <div className={styles.ProductInfo}>
            <p className={styles.ProductName}>{product?.name}</p>
            <p className={styles.ProductMeta}>
              {product?.meta_data?.find(m => m.key === "pa_weight")?.value || "N/A"} &nbsp;|&nbsp; Qty: {product?.quantity}
            </p>

            <div className={styles.DetailsGrid}>
              <p>
                <span>Delivery Frequency:</span> {sub.billing_interval} {sub.billing_period}
              </p>
              <p>
                <span>Price per delivery:</span> {sub.currency} {sub.total}
              </p>
              <p>
                <span>
                  {sub.status === "active"
                    ? "Next Payment:"
                    : "Last Payment:"}
                </span>{" "}
                {sub.status === "active" ? formatDate(sub.next_payment_date_gmt) : formatDate(sub.last_payment_date_gmt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.Section}>
        <h4>DELIVERY DETAILS</h4>

        <div className={styles.InfoBox}>
          <div className={styles.InfoHeader}>
            <div className={styles.InfoHeaderLeft}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_3225_18657"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                >
                  <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_3225_18657)">
                  <path
                    d="M3.17984 17.85C4.06058 16.9667 5.08402 16.2708 6.25018 15.7625C7.41634 15.2542 8.67628 15 10.03 15C11.3837 15 12.6437 15.2542 13.8098 15.7625C14.976 16.2708 15.9994 16.9667 16.8801 17.85V5H3.17984V17.85ZM10.03 13C10.976 13 11.7833 12.6583 12.452 11.975C13.1207 11.2917 13.4551 10.4667 13.4551 9.5C13.4551 8.53333 13.1207 7.70833 12.452 7.025C11.7833 6.34167 10.976 6 10.03 6C9.08402 6 8.27668 6.34167 7.60798 7.025C6.93927 7.70833 6.60492 8.53333 6.60492 9.5C6.60492 10.4667 6.93927 11.2917 7.60798 11.975C8.27668 12.6583 9.08402 13 10.03 13ZM3.17984 21C2.64162 21 2.18086 20.8042 1.79758 20.4125C1.4143 20.0208 1.22266 19.55 1.22266 19V5C1.22266 4.45 1.4143 3.97917 1.79758 3.5875C2.18086 3.19583 2.64162 3 3.17984 3H16.8801C17.4184 3 17.8791 3.19583 18.2624 3.5875C18.6457 3.97917 18.8373 4.45 18.8373 5V19C18.8373 19.55 18.6457 20.0208 18.2624 20.4125C17.8791 20.8042 17.4184 21 16.8801 21H3.17984ZM4.86792 19H15.1921C14.4744 18.35 13.663 17.8542 12.7578 17.5125C11.8526 17.1708 10.9433 17 10.03 17C9.11664 17 8.19921 17.1708 7.2777 17.5125C6.35619 17.8542 5.55293 18.35 4.86792 19ZM10.03 11C9.62225 11 9.27566 10.8542 8.99024 10.5625C8.70482 10.2708 8.56211 9.91667 8.56211 9.5C8.56211 9.08333 8.70482 8.72917 8.99024 8.4375C9.27566 8.14583 9.62225 8 10.03 8C10.4377 8 10.7843 8.14583 11.0698 8.4375C11.3552 8.72917 11.4979 9.08333 11.4979 9.5C11.4979 9.91667 11.3552 10.2708 11.0698 10.5625C10.7843 10.8542 10.4377 11 10.03 11Z"
                    fill="#6E736A"
                  />
                </g>
              </svg>
            </div>
            <div className={styles.InfoHeaderRight}>
              <p>{sub.shipping.first_name} {sub.shipping.last_name}</p>
              <p>
                {sub.shipping.address_1} {sub.shipping.address_2}, {sub.shipping.city} {sub.shipping.state} {sub.shipping.postcode}
              </p>
            </div>
          </div>
          <div className={styles.InfoFooter}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_3225_18666"

                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_3225_18666)">
                <path
                  d="M20.3846 21.5959C18.2479 21.5959 16.1368 21.1294 14.0513 20.1965C11.9658 19.2637 10.0684 17.9414 8.35897 16.2296C6.64957 14.5179 5.32906 12.6179 4.39744 10.5296C3.46581 8.44136 3 6.32739 3 4.18775C3 3.87965 3.10256 3.62289 3.30769 3.41748C3.51282 3.21208 3.76923 3.10938 4.07692 3.10938H8.23077C8.47009 3.10938 8.68376 3.19068 8.87179 3.35329C9.05983 3.51591 9.17094 3.70847 9.20513 3.931L9.87179 7.52559C9.90598 7.79947 9.89744 8.03055 9.84615 8.21883C9.79487 8.40712 9.70085 8.56974 9.5641 8.70667L7.07692 11.2229C7.4188 11.8562 7.82479 12.4682 8.29487 13.0587C8.76496 13.6492 9.28205 14.2184 9.84615 14.7661C10.3761 15.2968 10.9316 15.7889 11.5128 16.2425C12.094 16.6961 12.7094 17.1112 13.359 17.4878L15.7692 15.0742C15.9231 14.9202 16.1239 14.8046 16.3718 14.7276C16.6197 14.6506 16.8632 14.6292 17.1026 14.6634L20.641 15.3823C20.8803 15.4508 21.0769 15.5749 21.2308 15.7546C21.3846 15.9344 21.4615 16.1355 21.4615 16.358V20.5175C21.4615 20.8256 21.359 21.0823 21.1538 21.2878C20.9487 21.4932 20.6923 21.5959 20.3846 21.5959ZM6.10256 9.27154L7.79487 7.57694L7.35897 5.16343H5.07692C5.16239 5.86523 5.28205 6.55847 5.4359 7.24316C5.58974 7.92784 5.81197 8.60397 6.10256 9.27154ZM15.2821 18.4634C15.9487 18.7544 16.6282 18.9855 17.3205 19.1567C18.0128 19.3278 18.7094 19.4391 19.4103 19.4905V17.231L17 16.7432L15.2821 18.4634Z"
                  fill="#6E736A"
                />
              </g>
            </svg>

            <p>{sub.billing.phone || sub.shipping.phone || "No phone provided"}</p>
          </div>
        </div>
      </div>

      <div className={styles.Section}>
        <h4>PAYMENT INFORMATION</h4>

        <div className={styles.InfoBoxbt}>
          <p>
            <strong>
              {sub.status === "active" ? "Next Payment" : "Last Payment"}
            </strong>
          </p>
          <p>{sub.status === "active" ? formatDate(sub.next_payment_date_gmt) : formatDate(sub.last_payment_date_gmt)}</p>
          <p>{sub.payment_method_title || "Credit Card"}</p>
        </div>

        <div className={styles.Table}>
          <div className={styles.TableHeader}>
            <span>Date</span>
            <span>Payment Method</span>
            <span>Invoice</span>
            <span>Total</span>
          </div>

          {paymentHistory && paymentHistory.length > 0 ? (
            paymentHistory.map((invoice) => (
              <div key={invoice.id} className={styles.TableRow}>
                <span>{formatDate(invoice.created * 1000)}</span>
                <span>Credit Card</span>
                <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className={styles.ViewLink}>View</a>
                <span>{invoice.currency.toUpperCase()} {(invoice.amount_paid / 100).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className={styles.TableRow} style={{ justifyContent: 'center', padding: '10px' }}>
              <span>No payment history found.</span>
            </div>
          )}
        </div>
      </div>

      {sub.status === "active" && (
        <>
          <button
            className={styles.CancelBtn}
            onClick={handleCancel}
            disabled={cancelling}
            style={{ opacity: cancelling ? 0.7 : 1, cursor: cancelling ? 'not-allowed' : 'pointer' }}
          >
            {cancelling ? "Cancelling..." : "Cancel Subscription"}
          </button>
          <p className={styles.Note}>
            Your subscription remains active until cancelled. You may cancel at
            any time.
          </p>
        </>
      )}
    </div>
  );
}
