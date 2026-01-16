import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { generatePassword } from '../../../../../lib/nextauth';

const WC_API_URL = process.env.WC_API_URL;
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const WP_URL = process.env.WP_URL;

async function wcCreateCustomer(email, password, first_name = '', last_name = '') {
  const wcBase = `${WC_API_URL.replace(/\/$/, '')}/wp-json/wc/v3`;
  const url = `${wcBase}/customers?consumer_key=${encodeURIComponent(WC_KEY)}&consumer_secret=${encodeURIComponent(WC_SECRET)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, first_name, last_name }),
  });
  return res;
}

async function wcFindCustomerByEmail(email) {
  const wcBase = `${WC_API_URL.replace(/\/$/, '')}/wp-json/wc/v3`;
  const url = `${wcBase}/customers?email=${encodeURIComponent(email)}&consumer_key=${encodeURIComponent(WC_KEY)}&consumer_secret=${encodeURIComponent(
    WC_SECRET
  )}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function wcUpdateCustomerPassword(id, password) {
  const wcBase = `${WC_API_URL.replace(/\/$/, '')}/wp-json/wc/v3`;
  const url = `${wcBase}/customers/${encodeURIComponent(id)}?consumer_key=${encodeURIComponent(WC_KEY)}&consumer_secret=${encodeURIComponent(
    WC_SECRET
  )}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res;
}

export async function GET(req) {
  try {
    // get NextAuth token (server-side) from cookies
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const email = token.email;
    const name = token.name || '';
    const parts = name.split(' ');
    const first_name = parts.shift() || '';
    const last_name = parts.join(' ') || '';

    if (!WC_API_URL || !WC_KEY || !WC_SECRET || !WP_URL) {
      console.warn('WooCommerce/WP env not configured; skipping WP sync');
      return NextResponse.redirect(new URL('/', req.url));
    }

    const AUTO_CREATE = (String(process.env.WP_AUTO_CREATE || 'true').toLowerCase() !== 'false');

    const password = generatePassword(20);

    // Try create (only if AUTO_CREATE enabled)
    let createRes = null;
    if (AUTO_CREATE) {
      createRes = await wcCreateCustomer(email, password, first_name, last_name);

      if (!createRes.ok) {
        // try find existing user but DO NOT change their password here — changing existing
        // user passwords can lock real users out. Instead, log and proceed to token attempts.
        const existing = await wcFindCustomerByEmail(email);
        if (!existing) {
          // if create failed and no existing user, log details for debugging
          const txt = await createRes.text().catch(() => '');
          console.warn('Failed creating customer:', createRes.status, txt.slice?.(0, 400) || txt);
        } else {
          if (process.env.NODE_ENV !== 'production') console.warn('Customer exists but create returned non-ok; will not change existing password', existing.id);
        }
      }
    } else {
      // If auto-create disabled, just check for existing
      const existing = await wcFindCustomerByEmail(email);
      if (!existing) {
        // redirect user to signup flow with email prefilled
        const target = new URL('/auth/signup', req.url);
        target.searchParams.set('email', email);
        return NextResponse.redirect(target);
      }
    }

    // Obtain WP JWT token using email+password. Be robust: try username=email, then try username if available from WC response,
    // and if token fails, update existing customer's password and retry.
    let jwtToken = null;
    async function tryGetToken(creds) {
      try {
        const tRes = await fetch(`${WP_URL.replace(/\/$/, '')}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(creds),
        });
        if (tRes.ok) {
          const data = await tRes.json().catch(() => null);
          return data?.token || null;
        }
        const txt = await tRes.text().catch(() => '');
        if (process.env.NODE_ENV !== 'production') console.warn('Token attempt failed', creds, tRes.status, txt.slice?.(0, 400) || txt);
        return null;
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Error requesting WP token', err?.message || err, creds);
        return null;
      }
    }


    // First attempt: username = email
    jwtToken = await tryGetToken({ username: email, password });

    // If failed, check if wcFindCustomerByEmail returned an object with a username/login field
    let existing = null;
    try {
      existing = await wcFindCustomerByEmail(email);
    } catch (e) {
      existing = null;
    }

    if (!jwtToken && existing) {
      // Try with a username field if available
      const usernameCandidate = existing.username || existing.login || existing.slug || null;
      if (usernameCandidate) {
        jwtToken = await tryGetToken({ username: usernameCandidate, password });
      }
    }

    // If still not token and we have an existing user, DO NOT attempt to change their password here.
    // Changing passwords silently can lock users out; instead, log and let the caller handle password resets.
    if (!jwtToken && existing && existing.id) {
      if (process.env.NODE_ENV !== 'production') console.warn('Unable to obtain WP token for existing customer; will not change password automatically', existing.id);
    }

    // If still no token and auto-create disabled, redirect to login with notice
    if (!jwtToken && !AUTO_CREATE) {
      const t = new URL('/auth/login', req.url);
      t.searchParams.set('wp_sync', 'failed');
      t.searchParams.set('email', email);
      return NextResponse.redirect(t);
    }


    const nextRes = NextResponse.redirect(new URL('/', req.url));
    if (jwtToken) {
      nextRes.cookies.set('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
    }

    return nextRes;
  } catch (err) {
    console.warn('wp-sync error', err?.message || err);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
