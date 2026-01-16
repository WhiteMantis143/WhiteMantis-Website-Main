"use client";
import React from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutButtonClient() {
  const router = useRouter();

  async function handleLogout() {
    try {
      // clear WP token cookie server-side
      await fetch('/api/website/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('error clearing wp cookie', e);
    }

    try {
      // sign out from NextAuth (no redirect)
      await signOut({ redirect: false });
    } catch (e) {
      console.error('nextauth signOut error', e);
    }

    // navigate to home and refresh
    router.push('/');
    try { router.refresh(); } catch (e) { }
  }

  return (
    <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
  );
}
