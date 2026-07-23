"use client";

import { ReactNode, Suspense, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useRequireAuth } from "@/lib/auth-context";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div>
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Suspense fallback={null}>
        <Sidebar open={sidebarOpen} />
      </Suspense>
      <main className="pt-28 md:ml-[250px] min-h-screen px-4 pb-6 md:px-8">{children}</main>
    </div>
  );
}
