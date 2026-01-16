"use client";
import NavigationStrip from "./_components/NavigationStrip/NavigationStrip";
import Landing from "./_components/Landing/Landing";
import Lisiting from "./_components/Listing/Lisiting";

// Disable static generation to prevent SSR errors with context providers
export const dynamic = 'force-dynamic';

export default function Shop() {
  return (
    <>
      <Landing />
      <NavigationStrip />
      <Lisiting />
    </>
  );
}
