import { redirect } from 'next/navigation';

export default function CoffeeDripBags() {
  // Prevent direct top-level access; redirect to the Shop child page.
  redirect('/shop/coffee-dripbags');
}
  