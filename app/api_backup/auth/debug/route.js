import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';

export async function GET(req) {
  // Dev-only safety
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
  // cast to any to avoid TS/typing issues in mixed JS/TS project
  const session = /** @type {any} */ (await getServerSession(authOptions));

    // Read cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const hasWpToken = cookieHeader.split(';').map(c => c.trim()).some(c => c.startsWith('token='));
    let wpMe = null;
    if (hasWpToken && process.env.WP_URL) {
      try {
        const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
        const token = match ? match.split('=')[1] : null;
        const res = await fetch(`${process.env.WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        wpMe = { ok: res.ok, status: res.status, body: await res.text().catch(() => '') };
      } catch (e) {
        wpMe = { error: String(e) };
      }
    }

    return NextResponse.json({ session: session ?? null, hasWpToken, wpMe });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
