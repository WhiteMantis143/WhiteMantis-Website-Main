import { redirect } from 'next/navigation';

export default function CoffeeCapsules() {
  // Prevent direct top-level access; redirect to the Shop child page.
  redirect('/shop/coffee-capsules');
}
