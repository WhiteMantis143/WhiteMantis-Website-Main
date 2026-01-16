import { redirect } from 'next/navigation';

export default function ProductsPage() {
  // Products route removed — redirect to /shop
  redirect('/shop');
}
