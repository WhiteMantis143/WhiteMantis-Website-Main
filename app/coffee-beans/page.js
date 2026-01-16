import { redirect } from 'next/navigation';

export default function CoffeeBeans() {
  // Prevent direct access to the top-level route; redirect to the Shop child.
  redirect('/shop/coffee-beans');
}
