"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4"
      style={{ background: "var(--ink)" }}
    >
      <button
        className="md:hidden mr-3 text-white border border-white/25 rounded px-2 py-1"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <Link href="/" className="text-white font-semibold tracking-wide flex items-center gap-2">
        <span className="text-gray-400">⚙</span> SPU OA System
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {user?.isAdmin && (
          <Link
            href="/admin/users"
            className="hidden sm:flex items-center gap-1 text-sm text-white border border-white/25 rounded px-3 py-1.5 hover:bg-white/10"
          >
            ⚙ จัดการระบบ
          </Link>
        )}
        <div className="relative">
          <button
            className="flex items-center gap-2 text-sm text-white border border-white/25 rounded px-3 py-1.5 hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
          >
            👤 {user?.realName ?? "ผู้ใช้งาน"}
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-md border shadow-lg bg-white"
              style={{ borderColor: "var(--line)" }}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
