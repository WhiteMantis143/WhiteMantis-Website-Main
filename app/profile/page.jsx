"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogoutButtonClient from "../_components/LogoutButton";
import OrdersClient from "./OrdersClient";
import ProfileAddressClient from "./ProfileAddressClient";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({});
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Allow both authenticated and unauthenticated users
    // Guests can also use the profile page
    if (status === "loading") return;

    fetchProfile();
  }, [status]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/website/profile/get", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data?.profile || {});
        setIsGuest(data?.isGuest || false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const billing = profile?.billing || {};
  const displayName = profile.displayName || profile.full_name || session?.user?.name ||
    (session?.user?.email ? session.user.email.split("@")[0] : "Guest User");
  const email = profile.email || session?.user?.email || "";
  const avatar = profile.avatar || session?.user?.image || null;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>My Profile {isGuest && <span style={{ fontSize: 16, color: '#999' }}>(Guest Mode)</span>}</h1>

      {/* Profile Header Section */}
      <div style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        padding: 20,
        background: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 24
      }}>
        {avatar && (
          <img
            src={avatar}
            alt={displayName}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>{displayName}</h2>
          <p style={{ margin: 0, color: "#666" }}>
            <strong>Email:</strong> {email}
          </p>
          {profile.username && (
            <p style={{ margin: "4px 0", color: "#666" }}>
              <strong>Username:</strong> {profile.username}
            </p>
          )}
          {profile.role && (
            <p style={{ margin: "4px 0", color: "#666" }}>
              <strong>Role:</strong> {profile.role}
            </p>
          )}
          {profile.id && (
            <p style={{ margin: "4px 0", color: "#999", fontSize: 12 }}>
              Customer ID: {profile.id}
            </p>
          )}
        </div>
      </div>

      {/* Account Information */}
      {(profile.dateCreated || profile.dateModified) && (
        <div style={{
          padding: 16,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          marginBottom: 24
        }}>
          <h3 style={{ marginTop: 0 }}>Account Information</h3>
          {profile.dateCreated && (
            <p style={{ margin: "8px 0" }}>
              <strong>Member since:</strong>{" "}
              {new Date(profile.dateCreated).toLocaleDateString()}
            </p>
          )}
          {profile.dateModified && (
            <p style={{ margin: "8px 0" }}>
              <strong>Last updated:</strong>{" "}
              {new Date(profile.dateModified).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Address Section */}
      <ProfileAddressClient initialProfile={profile} />

      {/* Orders Section */}
      <div style={{ marginTop: 28 }}>
        <OrdersClient />
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: 24 }}>
        <LogoutButtonClient />
      </div>
    </div>
  );
}
