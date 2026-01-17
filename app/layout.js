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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <CartProvider>

            <GlobalLoader />
            <Navbar />
            <NavbarMobile />
            {children}
            <Footer />
            <CartSideBar />
            <NewsLetter />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
