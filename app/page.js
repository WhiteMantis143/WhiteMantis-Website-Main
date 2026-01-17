import { Suspense } from "react";
import Coffees from "./_components/Home/Coffees/Coffees";
import Community from "./_components/Home/Community/Community";
import Landing from "./_components/Home/Landing/Landing";
import Shop from "./_components/Home/Shop/Shop";
import Subscribe from "./_components/Home/Subscribe/Subscribe";
import TheRoster from "./_components/Home/TheRoster/TheRoster";
import ErrorHandler from "./_components/ErrorHandler";


export const metadata = {
  title: "White Mantis Specialty Coffee Roasters | Built on Craft, Driven by Community",
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
};

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>

      <Landing />
      <Coffees />
      <Shop />
      {/* <Subscribe /> */}
      <Community />
      <TheRoster />
    </>
  );
}
