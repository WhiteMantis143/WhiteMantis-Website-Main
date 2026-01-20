import { Suspense } from "react";
import Coffees from "./_components/Home/Coffees/Coffees";
import Community from "./_components/Home/Community/Community";
import Landing from "./_components/Home/Landing/Landing";
import Shop from "./_components/Home/Shop/Shop";
import Subscribe from "./_components/Home/Subscribe/Subscribe";
import TheRoster from "./_components/Home/TheRoster/TheRoster";
import ErrorHandler from "./_components/ErrorHandler";
import Partnerships from "./about-us/_components/Partnerships/Partnerships";

export const metadata = {
  title:
    "White Mantis Specialty Coffee Roasters | Built on Craft, Driven by Community",
  description:
    "Experience premium specialty coffee in Dubai. Shop our curated selection of coffee beans, drips, and capsules.",
  keywords: [
    "specialty coffee Dubai",
    "White Mantis Roasters",
    "coffee beans UAE",
    "coffee capsules",
    "white mantis coffee",
    "coffee subscription",
  ],
  openGraph: {
    title:
      "White Mantis Specialty Coffee Roasters | Built on Craft, Driven by Community",
    description:
      "Experience premium specialty coffee in Dubai. Shop our curated selection of coffee beans, drips, and capsules.",
    url: "https://www.whitemantis.ae/",
    images: [
      {
        url: "/social-thumbnail.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "White Mantis Specialty Coffee Roasters | Built on Craft, Driven by Community",
    description:
      "Experience premium specialty coffee in Dubai.",
    images: ["/social-thumbnail.png"],
  },
  
};

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>

      <Landing />
      <div className="sectionPadding"></div>
      <Coffees />
      <div className="sectionPadding"></div>
      <Shop />
      {/* <Subscribe /> */}
      <div className="sectionPadding"></div>
      <Community />
      <div className="sectionPadding"></div>
      <Partnerships />
      <div className="sectionPadding"></div>
      <TheRoster />
      <div className="sectionPadding"></div>
    </>
  );
}
