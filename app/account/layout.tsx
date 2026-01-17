import React from "react";
import Breadcrumb from "./_components/Breadcrumb/Breadcrumb";
import Sidebar from "./_components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/nextauth";
import { redirect } from "next/navigation";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className={styles.accountRoot}>
      <Breadcrumb />
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Sidebar />
        </aside>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
