import React from "react";
import styles from "./Landing.module.css";
import Image from "next/image";
import one from "./1.png";
import Link from "next/link";

const Landing = () => {
  return (
    <>
      {/* <div className={styles.extraTopSpaceMopbile}></div> */}
      <div className={styles.main}>
        <div className={styles.MainConatiner}>
          <div className={styles.LeftConatiner}>
            <div className={styles.heading}>
              <h2>Let&apos;s Talk Coffee</h2>
              <div className={styles.lineleft}></div>
              <h3>Support and Sourcing</h3>
            </div>
            <div className={styles.para}>
              <p>
                Whether seeking technical support for your brew or exploring
                wholesale sourcing for specialty beans, our experts are ready to
                assist.
              </p>
            </div>
          </div>
          <div className={styles.MiddleContainer}>
            <Image src={one} alt="Landing Image" className={styles.image} />
          </div>
          <div className={styles.RightContainer}>
            <div className={styles.RightContainerTop}>
              <div className={styles.First}>
                <div className={styles.FirstTop}>
                  <p>Need to speak with us?</p>
                </div>
                <div className={styles.FirstBottom}>
                  <Link href="tel:+9715589535337">+971 - 05 8953 5337</Link>
                </div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.Second}>
                <div className={styles.SecondTop}>
                  <p>Want to send an email?</p>
                </div>
                <div className={styles.SecondBottom}>
                  <Link
                    href="mailto:hello@whitemantis.ae"
                    style={{ textDecoration: "underline" }}
                  >
                    hello@whitemantis.ae
                  </Link>
                </div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.Third}>
                <div className={styles.ThirdTop}>
                  <p>Where can you find us?</p>
                </div>
                <div className={styles.ThirdBottom}>
                  <p>Warehouse #2 - 26 </p>
                  <p>26th St - Al Qouz Ind.fourth</p>
                  <p>Al Quoz, Dubai</p>
                </div>
                {/* <div className={styles.mobline}></div> */}
              </div>
              <div className={styles.line}></div>

              <div className={styles.RightContainerBottom}>
                <div className={styles.RightContainerBottomHeading}>
                  <h5>Follow us</h5>
                </div>
                <div className={styles.RightContainerBottomSocials}>
                  <div className={styles.socialOne}>
                    <p>Instagram </p>
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.352421 7.57268L7.42349 0.501613M7.42349 0.501613V6.86557M7.42349 0.501613H1.05953"
                        stroke="#6C7A5F"
                      />
                    </svg>
                  </div>

                  {/* <div className={styles.InstaMobile}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.5767 4.70703H8.87009C6.55088 4.70703 4.66406 6.59384 4.66406 8.91305V14.6197C4.66406 16.9389 6.55088 18.8257 8.87009 18.8257H14.5767C16.8959 18.8257 18.7827 16.9389 18.7827 14.6197V8.91305C18.7827 6.59384 16.8959 4.70703 14.5767 4.70703ZM17.3624 14.6197C17.3624 16.1581 16.1152 17.4053 14.5767 17.4053H8.87009C7.33161 17.4053 6.0844 16.1581 6.0844 14.6197V8.91305C6.0844 7.37455 7.33161 6.12737 8.87009 6.12737H14.5767C16.1152 6.12737 17.3624 7.37455 17.3624 8.91305L17.3624 14.6197Z"
                        fill="#6E736A"
                      />
                      <path
                        d="M11.7219 8.11719C9.70839 8.11719 8.07031 9.75529 8.07031 11.7687C8.07031 13.7822 9.70839 15.4203 11.7219 15.4203C13.7354 15.4203 15.3735 13.7822 15.3735 11.7687C15.3735 9.75526 13.7354 8.11719 11.7219 8.11719ZM11.7219 14C10.4896 14 9.49065 13.0011 9.49065 11.7688C9.49065 10.5365 10.4896 9.53752 11.7219 9.53752C12.9542 9.53752 13.9531 10.5365 13.9531 11.7688C13.9531 13.001 12.9542 14 11.7219 14Z"
                        fill="#6E736A"
                      />
                      <ellipse
                        cx="15.3828"
                        cy="8.14453"
                        rx="0.874996"
                        ry="0.874994"
                        fill="#6E736A"
                      />
                      <rect
                        x="0.5"
                        y="0.5"
                        width="22.3155"
                        height="22.3155"
                        stroke="#6E736A"
                      />
                    </svg>
                  </div> */}
                  {/* <div className={styles.socialTwo}>
                  <p>Linkedin </p>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.352421 7.57268L7.42349 0.501613M7.42349 0.501613V6.86557M7.42349 0.501613H1.05953"
                      stroke="#6C7A5F"
                    />
                  </svg>
                </div>
                <div className={styles.LinkedinMobile}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.3925 12.9621V16.9833H15.0612V13.2314C15.0612 12.2889 14.724 11.6456 13.8802 11.6456C13.236 11.6456 12.8527 12.0791 12.684 12.4985C12.6225 12.6484 12.6067 12.857 12.6067 13.0669V16.9833H10.2747C10.2747 16.9833 10.3061 10.6288 10.2747 9.97041H12.6065V10.9645C12.6017 10.9719 12.5956 10.9799 12.5911 10.9871H12.6065V10.9645C12.9163 10.4873 13.4695 9.80565 14.708 9.80565C16.2423 9.80563 17.3925 10.808 17.3925 12.9621ZM7.83523 6.58984C7.03744 6.58984 6.51562 7.11313 6.51562 7.80127C6.51562 8.47441 7.02235 9.01358 7.80428 9.01358H7.81986C8.6331 9.01358 9.13886 8.47451 9.13886 7.80127C9.12354 7.11313 8.6331 6.58984 7.83523 6.58984ZM6.65413 16.9833H8.98529V9.97041H6.65413V16.9833Z"
                      fill="#6E736A"
                    />
                    <rect
                      x="0.5"
                      y="0.5"
                      width="22.3155"
                      height="22.3155"
                      stroke="#6E736A"
                    />
                  </svg>
                </div>
                <div className={styles.socialThree}>
                  <p>Facebook </p>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.352421 7.57268L7.42349 0.501613M7.42349 0.501613V6.86557M7.42349 0.501613H1.05953"
                      stroke="#6C7A5F"
                    />
                  </svg>
                </div>
                <div className={styles.FacebookMobile}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6571 5.79158L13.0894 5.78906C11.3281 5.78906 10.1899 6.95681 10.1899 8.76422V10.136H8.61369C8.47749 10.136 8.36719 10.2464 8.36719 10.3826V12.3701C8.36719 12.5063 8.47761 12.6166 8.61369 12.6166H10.1899V17.6317C10.1899 17.7679 10.3002 17.8782 10.4364 17.8782H12.493C12.6292 17.8782 12.7395 17.7678 12.7395 17.6317V12.6166H14.5825C14.7187 12.6166 14.829 12.5063 14.829 12.3701L14.8298 10.3826C14.8298 10.3172 14.8037 10.2546 14.7576 10.2083C14.7114 10.162 14.6485 10.136 14.5831 10.136H12.7395V8.97312C12.7395 8.41421 12.8727 8.13047 13.6007 8.13047L14.6568 8.1301C14.7929 8.1301 14.9032 8.01967 14.9032 7.88359V6.03808C14.9032 5.90213 14.793 5.79183 14.6571 5.79158Z"
                      fill="#6E736A"
                    />
                    <rect
                      x="0.5"
                      y="0.5"
                      width="22.3155"
                      height="22.3155"
                      stroke="#6E736A"
                    />
                  </svg>
                </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
