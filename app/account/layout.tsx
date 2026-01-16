import React from "react";
import Breadcrumb from "./_components/Breadcrumb/Breadcrumb";
import Sidebar from "./_components/Sidebar/Sidebar";
import styles from "./layout.module.css";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
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
