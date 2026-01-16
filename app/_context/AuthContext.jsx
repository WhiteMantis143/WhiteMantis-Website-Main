"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signOut as nextAuthSignOut, signIn, useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // normalize to same shape
      const name = session.user.name || (session.user.email ? (session.user.email || '').split('@')[0] : null);
      setUser({
        id: session.user.id || null,
        name,
        email: session.user.email || null,
        profile_image: session.user.profile_image || null
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [session, status]);

  async function login({ username, password }) {
    // Use NextAuth signIn
    const res = await signIn('credentials', {
      redirect: false,
      email: username,
      password
    });

    if (res?.error) {
      throw new Error(res.error || 'Login failed');
    }
    // Session update logic handled by useEffect
    return res;
  }

  async function signup({ email, password, first_name, last_name }) {
    const res = await fetch('/api/website/auth/user-auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    // auto-login
    try {
      await login({ username: email, password });
    } catch (e) {
      // ignore
    }
    return data;
  }

  async function logout() {
    await fetch('/api/website/auth/logout', { method: 'POST' });
    try {
      // also sign out of NextAuth if user used social sign-in
      await nextAuthSignOut({ redirect: false });
    } catch (e) { }
    // Cart system removed: clear any cart-related localStorage keys if present
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    } catch (e) { }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, reload: () => { } }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
