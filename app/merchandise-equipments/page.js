import { redirect } from 'next/navigation';

export default function MerchandiseAndEquipments() {
  // Redirect to the Shop child page to keep merchandise pages scoped under /shop
  redirect('/shop/merchandise-equipments');
}
