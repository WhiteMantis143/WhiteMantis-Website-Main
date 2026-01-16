import styles from "./terms.module.css";

const TermsAndConditions = () => {
  return (
    <div className={styles.mainPage}>
      <div className={styles.MainConatiner}>
        <div className={styles.Heading}>
          <h1>Terms and condition</h1>
        </div>
        <div className={styles.Desc}>
          <p>
            Welcome to White Mantis Roastery LLC(“White Mantis”, “we”, “our”,
            “us”). These Terms & Conditions govern your use of our website,
            mobile application, and related digital services.Some features
            described in these Terms, including online ordering, payments, and
            delivery, may be available through our mobile application or will be
            introduced on the website in future updates.
          </p>
        </div>
        <div className={styles.Content}>
          <h3>Eligibility</h3>
          <p>
            You must use our Services in compliance with applicable laws of the
            United Arab Emirates.
          </p>
        </div>
        <div className={styles.Content}>
          <h3>Account Registration</h3>
          <ul>
            <li>Account creation may be required to access certain features</li>
            <li>
              You are responsible for maintaining accurate account information
            </li>
            <li>You are responsible for safeguarding your login credentials</li>
          </ul>
        </div>
         <div className={styles.Content}>
          <h3>Products & Services</h3>
          <p>We offer roasted coffee, beverages, merchandise, equipment, and café-related services. Availability, pricing, and descriptions may change at any time.</p>

        </div>
        <div className={styles.Content}>
          <h3>Pricing & Payments</h3>
          <p>All prices are listed in AED. Payments, where applicable, must be completed using approved payment methods.</p>

        </div>
        <div className={styles.Content}>
          <h3>Shipping & Delivery</h3>
          <p>Delivery timelines are estimates only. Risk of loss transfers to the customer upon dispatch.</p>

        </div>
        <div className={styles.Content}>
          <h3>Returns & Refunds</h3>
          <p>Roasted coffee products are non-returnable. Equipment returns are accepted only if unused and approved after inspection.</p>

        </div>
        <div className={styles.Content}>
          <h3> Intellectual Property</h3>
          <p>All content, logos, designs, and trademarks are the property of White Mantis Roastery LLC and may not be used without written permission.</p>

        </div>
         <div className={styles.Content}>
          <h3> Limitation of Liability</h3>
          <p>To the fullest extent permitted by law, White Mantis shall not be liable for indirect, incidental, or consequential damages.</p>

        </div>
        <div className={styles.Content}>
          <h3>Governing Law</h3>
          <p>These Terms are governed by the laws of the United Arab Emirates, applicable in the Emirate of Dubai.</p>

        </div>
        <div className={styles.Content}>
          <h3>Changes to Terms</h3>
          <p>We may update these Terms at any time. Continued use of the Services signifies acceptance of updated terms.</p>

        </div>
        <div className={styles.Content}>
          <h3>Contact Information</h3>
          <ul>
            <li>White Mantis Roastery LLC</li>
            <li>Dubai, United Arab Emirates</li>
            <li>Email: hello@whitemantis.ae</li>
            <li>Phone: +971 58 953 5337</li>
          </ul>

        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
