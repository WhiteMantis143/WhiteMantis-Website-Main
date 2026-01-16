import { notFound } from 'next/navigation';

export default function CategoryPage() {
  // Old category pages under /shop/[category] are intentionally disabled.
  // We return a 404 so users cannot open the previous internal category pages.
  notFound();
}
