import { redirect } from "next/navigation";

export default async function AccountIndex() {
  redirect("/account/profile");
}
