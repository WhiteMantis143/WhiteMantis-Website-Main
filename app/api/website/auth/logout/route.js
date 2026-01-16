import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function clearAllCookies() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Delete all cookies
  allCookies.forEach(cookie => {
    cookieStore.delete(cookie.name);
  });

  console.log(`🍪 Cleared ${allCookies.length} cookie(s) on logout`);
}

export async function POST() {
  await clearAllCookies();
  return NextResponse.json({ ok: true });
}

// Support GET so visiting the URL in a browser will also clear auth cookies
export async function GET() {
  await clearAllCookies();
  return NextResponse.json({ ok: true });
}
