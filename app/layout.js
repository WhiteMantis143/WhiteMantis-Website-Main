import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

import Footer from "./_components/Footer/Footer";
import CartSideBar from "./_components/CartSideBar/CartSideBar";
import NewsLetter from "./workshops/_components/NewsLetter/NewsLetter";
import Navbar from "./_components/Navbar/Navbar";
import NavbarMobile from "./_components/Navbar/NavbarMobile";
import { CartProvider } from "./_context/CartContext";
import GlobalLoader from "./_components/GlobalLoader/GlobalLoader";
import { Toaster } from "react-hot-toast";
import SmoothScrollProvider from "./_providers/SmoothScrollProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WhiteMantis",
  description: "WhiteMantis",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "WhiteMantis",
    description: "WhiteMantis",
    images: [
      {
        url: "/social-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "WhiteMantis",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhiteMantis",
    description: "WhiteMantis",
    images: ["/social-thumbnail.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <SmoothScrollProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              containerStyle={{
                top: 100,
                right: 24,
                zIndex: 9999,
              }}
            />
            <GlobalLoader />
            <Navbar />
            <NavbarMobile />
            {children}
          
            <Footer />
            <CartSideBar />
            <NewsLetter />
          </CartProvider>
          </SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}

