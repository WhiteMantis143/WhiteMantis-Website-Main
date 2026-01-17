"use client";
import { redirect } from "next/navigation";

// Disable static generation to prevent SSR errors with context providers
export const dynamic = 'force-dynamic';

export default function Shop() {
  return (
    <>
      {redirect("/shop/coffee-beans")}
    </>
  );
}
