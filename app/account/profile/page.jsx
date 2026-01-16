// import React from "react";
import ProfileComponents from "../_components/ProfileComponents/ProfileComponents";
import { headers } from "next/headers";
async function getProfile() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const headerList = await headers();
  const res = await fetch(`${baseUrl}/api/website/profile/get`, {
    // Optional: Next.js caching options
    method: "GET",
    headers: Object.fromEntries(headerList.entries()),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function ProfilePage() {
  let data = {
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      shipping: { phone: "" },
      metaData: [],
    },
  };

  try {
    const fetchedData = await getProfile();
    if (fetchedData && fetchedData.profile) {
      data = fetchedData;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  return (
    <div>
      <ProfileComponents initialData={data} />
    </div>
  );
}
