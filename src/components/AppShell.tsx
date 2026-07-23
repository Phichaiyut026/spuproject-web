"use client";

import { ReactNode, Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ScrollToTop from "./ScrollToTop";
import { NavigationProgressProvider } from "./NavigationProgress";
import { useRequireAuth } from "@/lib/auth-context";

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-[var(--text-muted)]">
        <Loader2 className="animate-spin" size={18} /> กำลังโหลด...
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <NavigationProgressProvider>
        <div>
          <Sidebar
            open={sidebarOpen}
            collapsed={collapsed}
            onNavigate={() => setSidebarOpen(false)}
            onCollapse={() => setCollapsed((v) => !v)}
          />

          <div
            className={`flex min-h-screen flex-col transition-all duration-300 ${
              collapsed ? "md:ml-[76px]" : "md:ml-[262px]"
            }`}
          >
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
            <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          </div>

          <ScrollToTop />
        </div>
      </NavigationProgressProvider>
    </Suspense>
  );
}
