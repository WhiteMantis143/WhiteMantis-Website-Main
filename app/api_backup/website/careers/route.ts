import { NextResponse } from "next/server";

// Prefer public env for client-aware URLs, but fall back to server-side WP_URL
const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

if (!WP_BASE_URL) {
  console.warn(
    "[careers] WordPress base URL not set (set NEXT_PUBLIC_WORDPRESS_URL or WP_URL)"
  );
}

async function fetchJSON(url: string) {
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status}: ${txt}`);
  }
  return res.json();
}

function findApplyLinkInObj(acf: any): string | null {
  if (!acf || typeof acf !== "object") return null;
  const keys = Object.keys(acf);
  for (const k of keys) {
    const v = acf[k];
    if (typeof v === "string" && /https?:\/\//i.test(v)) {
      if (/apply|form|link/i.test(k) || /apply|form|link/i.test(v)) return v;
    }
  }
  for (const k of keys) {
    const v = acf[k];
    if (typeof v === "object") {
      const found = findApplyLinkInObj(v);
      if (found) return found;
    }
  }
  return null;
}

async function fetchAcfForPostIfNeeded(p: any) {
  if (p.acf && typeof p.acf === 'object') return p.acf;
  // try common ACF REST endpoint: /wp-json/acf/v3/posts/{id}
  try {
    const acfData = await fetchJSON(`${WP_BASE_URL}/wp-json/acf/v3/posts/${p.id}`);
    // plugin returns fields under 'acf' or 'fields'
    if (acfData && typeof acfData === 'object') {
      if (acfData.acf) return acfData.acf;
      if (acfData.fields) return acfData.fields;
      // some returns an object with fields at top-level
      return acfData;
    }
  } catch (e) {
    // ignore errors — many instances won't have this route
  }
  return null;
}

export async function GET() {
  if (!WP_BASE_URL) {
    return NextResponse.json({ posts: [] }, { status: 500 });
  }

  try {
    // Try category slug 'careers' then 'career'
    let categoryId: number | null = null;

    try {
      const cats = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/categories?slug=careers`);
      if (Array.isArray(cats) && cats.length) categoryId = cats[0].id;
    } catch (e) {
      // continue
    }

    if (!categoryId) {
      try {
        const cats2 = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/categories?slug=career`);
        if (Array.isArray(cats2) && cats2.length) categoryId = cats2[0].id;
      } catch (e) {
        // continue
      }
    }

    // fallback: try tags
    if (!categoryId) {
      try {
        const tags = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/tags?slug=careers`);
        if (Array.isArray(tags) && tags.length) categoryId = tags[0].id; // will be used as 'tags' parameter
      } catch (e) {
        // continue
      }
    }

    if (!categoryId) {
      // No category or tag found — return empty list
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    // Determine whether we matched a category or a tag by checking the categories endpoint responses above
    // We'll attempt both (category then tag) — safe approach: request both category and tag filters and merge unique posts.

    // First try as category
    let posts: any[] = [];
    try {
      const p = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=100&categories=${categoryId}&_embed`);
      if (Array.isArray(p)) posts = posts.concat(p);
    } catch (e) {
      // ignore
    }

    // If none found, try as tag
    if (posts.length === 0) {
      try {
        const p2 = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=100&tags=${categoryId}&_embed`);
        if (Array.isArray(p2)) posts = posts.concat(p2);
      } catch (e) {
        // ignore
      }
    }

    // Map to a light shape for client; fetch ACF when missing and compute applyLink
    const mapped = await Promise.all(
      posts.map(async (p: any) => {
        const acf = p.acf ?? (await fetchAcfForPostIfNeeded(p)) ?? null;

        const preferredKeys = [
          "apply_form_link",
          "apply_link",
          "apply",
          "application_link",
          "application_form_link",
          "apply_form",
          "apply_url",
          "applyformlink",
          "apply_form_link_url",
        ];

        let applyLink: string | null = null;
        let applyLinkSource: string | null = null;
        if (acf && typeof acf === 'object') {
          // Prefer the exact ACF field name `apply_form_link` when present
          if (typeof acf.apply_form_link === 'string' && /https?:\/\//i.test(acf.apply_form_link)) {
            applyLink = acf.apply_form_link;
            applyLinkSource = 'acf.apply_form_link';
          }

          // then try other known keys
          if (!applyLink) {
            for (const k of preferredKeys) {
              const v = acf[k];
              if (typeof v === 'string' && /https?:\/\//i.test(v)) {
                applyLink = v;
                applyLinkSource = `acf.${k}`;
                break;
              }
            }
          }

          // final recursive fallback into ACF object
          if (!applyLink) applyLink = findApplyLinkInObj(acf);
        }

        // Also check for a top-level REST field `apply_form_link` (if WP exposes it via register_rest_field)
        if (!applyLink && typeof p.apply_form_link === 'string' && /https?:\/\//i.test(p.apply_form_link)) {
          applyLink = p.apply_form_link;
          applyLinkSource = 'post.apply_form_link';
        }

        // fallback to post link if no ACF apply link
        if (!applyLink) {
          applyLink = p.link ?? (p.guid && p.guid.rendered) ?? null;
          applyLinkSource = applyLinkSource ?? (applyLink ? 'post.link' : null);
        }

        return {
          id: p.id,
          title: p.title?.rendered ?? "",
          excerpt: p.excerpt?.rendered ?? null,
          content: p.content?.rendered ?? null,
          acf: acf,
          link: p.link ?? (p.guid && p.guid.rendered) ?? null,
          applyLink,
          applyLinkSource,
          raw: p,
        };
      })
    );

    return NextResponse.json({ posts: mapped }, { status: 200 });
  } catch (err: any) {
    console.error("[careers] API error:", err);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
