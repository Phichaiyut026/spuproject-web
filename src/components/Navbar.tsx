"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ALL_LINKS } from "./nav-config";

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const results = query
    ? ALL_LINKS.filter(
        (l) =>
          l.label.toLowerCase().includes(query.toLowerCase()) ||
          (l.keywords ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : ALL_LINKS.slice(0, 5);

  function go(href: string) {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-[color:var(--surface-card)]/90 px-4 backdrop-blur md:px-6"
      style={{ borderColor: "var(--line)" }}
    >
      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--hover-tint)] md:hidden"
        onClick={onToggleSidebar}
        aria-label="เปิด/ปิดเมนู"
      >
        <Menu size={20} />
      </button>

      {/* search */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="ค้นหาเมนู / ไปยังหน้า..."
            className="w-full rounded-lg border bg-[var(--surface-bg)] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand)]/15"
            style={{ borderColor: "var(--line-strong)" }}
          />
        </div>
        {searchOpen && (
          <div
            className="animate-fade-in absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border bg-white shadow-lg"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {query ? "ผลการค้นหา" : "ทางลัด"}
            </div>
            {results.length === 0 && (
              <div className="px-3 pb-3 text-sm text-[var(--text-muted)]">ไม่พบเมนูที่ตรงกับคำค้น</div>
            )}
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.href}
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--brand-tint)] text-[var(--brand-strong)]">
                    <Icon size={15} />
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* notifications */}
        <button
          className="relative grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
          aria-label="การแจ้งเตือน"
        >
          <Bell size={19} />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-white"
            style={{ background: "var(--brand)" }}
          />
        </button>

        {/* user menu */}
        <div ref={menuRef} className="relative">
          <button
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-[var(--hover-tint)]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold uppercase text-white"
              style={{ background: "var(--ink)" }}
            >
              {initials(user?.realName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-[var(--ink)]">
                {user?.realName ?? "ผู้ใช้งาน"}
              </span>
              <span className="block text-[11px] leading-tight text-[var(--text-muted)]">
                {user?.isAdmin ? "ผู้ดูแลระบบ" : user?.roleCode ?? "ผู้ใช้งาน"}
              </span>
            </span>
            <ChevronDown size={15} className="hidden text-[var(--text-muted)] sm:block" />
          </button>

          {menuOpen && (
            <div
              className="animate-fade-in absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--line)" }}>
                <div className="text-sm font-semibold text-[var(--ink)]">{user?.realName}</div>
                <div className="truncate text-xs text-[var(--text-muted)]">{user?.email ?? user?.username}</div>
              </div>
              {user?.isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
                >
                  <ShieldCheck size={16} /> จัดการผู้ใช้งาน
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
              >
                <Settings size={16} /> ตั้งค่าบัญชี
              </button>
              <div className="border-t" style={{ borderColor: "var(--line)" }} />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-tint)]"
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
