import { NextResponse } from "next/server";
const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

if (!WP_BASE_URL) {
  console.warn(
    "[workshops] WordPress base URL not set (set NEXT_PUBLIC_WORDPRESS_URL or WP_URL)"
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

function findLinkInObj(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "string" && /https?:\/\//i.test(v)) return v;
    if (typeof v === "object") {
      const found = findLinkInObj(v);
      if (found) return found;
    }
  }
  return null;
}

function findDateInObj(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === "string") {

    if (/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(obj) || /\d{4}-\d{2}-\d{2}/.test(obj)) return obj;
  }
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string") {
        if (/\b(workkshop|workshop|date)\b/i.test(k) && /\d{4}|\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(v)) return v;
        if (/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(v) || /\d{4}-\d{2}-\d{2}/.test(v)) return v;
      }
      if (typeof v === "object") {
        const found = findDateInObj(v);
        if (found) return found;
      }
    }
  }
  return null;
}

function findTimeInObj(obj: any): string | null {
  if (!obj) return null;
  const timeRegex = /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i;
  if (typeof obj === "string") {
    if (timeRegex.test(obj)) return obj.match(timeRegex)![0];
  }
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string") {
        if (/\b(time|workshop_time)\b/i.test(k) && timeRegex.test(v)) return v.match(timeRegex)![0];
        if (timeRegex.test(v)) return v.match(timeRegex)![0];
      }
      if (typeof v === "object") {
        const found = findTimeInObj(v);
        if (found) return found;
      }
    }
  }
  return null;
}

async function fetchAcfForPostIfNeeded(p: any) {
  if (p.acf && typeof p.acf === 'object') return p.acf;
  try {
    const acfData = await fetchJSON(`${WP_BASE_URL}/wp-json/acf/v3/posts/${p.id}`);
    if (acfData && typeof acfData === 'object') {
      if (acfData.acf) return acfData.acf;
      if (acfData.fields) return acfData.fields;
      return acfData;
    }
  } catch (e) {
 
  }
  return null;
}

export async function GET() {
  if (!WP_BASE_URL) {
    return NextResponse.json({ posts: [] }, { status: 500 });
  }

  try {
   
    let categoryId: number | null = null;

    try {
      const cats = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/categories?slug=workshop`);
      if (Array.isArray(cats) && cats.length) categoryId = cats[0].id;
    } catch (e) {
 
    }

    if (!categoryId) {
      try {
        const cats2 = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/categories?slug=workshops`);
        if (Array.isArray(cats2) && cats2.length) categoryId = cats2[0].id;
      } catch (e) {
  
      }
    }

    if (!categoryId) {
      try {
        const tags = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/tags?slug=workshop`);
        if (Array.isArray(tags) && tags.length) categoryId = tags[0].id;
      } catch (e) {
    
      }
    }

    if (!categoryId) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }


    let posts: any[] = [];
    try {
      const p = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=100&categories=${categoryId}&_embed`);
      if (Array.isArray(p)) posts = posts.concat(p);
    } catch (e) {}

    if (posts.length === 0) {
      try {
        const p2 = await fetchJSON(`${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=100&tags=${categoryId}&_embed`);
        if (Array.isArray(p2)) posts = posts.concat(p2);
      } catch (e) {}
    }

    const mapped = await Promise.all(
      posts.map(async (p: any) => {
        const acf = p.acf ?? (await fetchAcfForPostIfNeeded(p)) ?? null;

   
        let workshopLink: string | null = null;
        if (acf && typeof acf === 'object') {
          if (typeof acf.workshop_redirect === 'string' && /https?:\/\//i.test(acf.workshop_redirect)) {
            workshopLink = acf.workshop_redirect;
          }
          if (!workshopLink && typeof acf.workshop_link === 'string' && /https?:\/\//i.test(acf.workshop_link)) {
            workshopLink = acf.workshop_link;
          }
        }

        if (!workshopLink) workshopLink = findLinkInObj(acf) ?? (p.link ?? (p.guid && p.guid.rendered) ?? null);

        let featuredImage: string | null = null;
        try {
          const fm = p._embedded?.['wp:featuredmedia']?.[0];
          if (fm && fm.source_url) featuredImage = fm.source_url;
        } catch (e) {}

  
        const guessedDate = acf?.workshop_date ?? acf?.workkshop_date ?? findDateInObj(acf) ?? null;
        const guessedTime = acf?.workshop_time ?? acf?.time ?? findTimeInObj(acf) ?? null;

        return {
          id: p.id,
          title: p.title?.rendered ?? "",
          excerpt: p.excerpt?.rendered ?? null,
          content: p.content?.rendered ?? null,
          acf,
          link: p.link ?? (p.guid && p.guid.rendered) ?? null,
          workshopLink,
          workshop_date: guessedDate,
          workshop_time: guessedTime,
          featuredImage,
          raw: p,
        };
      })
    );

    return NextResponse.json({ posts: mapped }, { status: 200 });
  } catch (err: any) {
    console.error("[workshops] API error:", err);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
