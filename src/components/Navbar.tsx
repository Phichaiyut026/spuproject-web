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
  CheckCheck,
  FileText,
  Clock,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigationProgress } from "./NavigationProgress";
import { ALL_LINKS } from "./nav-config";

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

type Notification = {
  id: number;
  icon: typeof FileText;
  title: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, icon: FileText, title: "มีเอกสารรออนุมัติ 3 รายการ", time: "5 นาทีที่แล้ว", unread: true },
  { id: 2, icon: UserPlus, title: "คำขอเปิดสิทธิ์ผู้ใช้งานใหม่", time: "1 ชั่วโมงที่แล้ว", unread: true },
  { id: 3, icon: Clock, title: "งานของคุณใกล้ถึงกำหนดส่ง", time: "เมื่อวานนี้", unread: false },
];

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { start } = useNavigationProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ปุ่มลัด: Ctrl/⌘ + K โฟกัสช่องค้นหา, Esc ปิด
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function handleLogout() {
    start();
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
    if (href !== window.location.pathname + window.location.search) start();
    router.push(href);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
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
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="ค้นหาเมนู / ไปยังหน้า..."
            className="w-full rounded-lg border bg-[var(--surface-bg)] py-2 pl-9 pr-16 text-sm outline-none transition focus:border-[var(--brand)] focus:bg-white focus:ring-2 focus:ring-[var(--brand)]/15"
            style={{ borderColor: "var(--line-strong)" }}
          />
          <kbd
            className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] sm:block"
            style={{ borderColor: "var(--line-strong)" }}
          >
            Ctrl K
          </kbd>
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
        <div ref={notifRef} className="relative">
          <button
            className="relative grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
            aria-label="การแจ้งเตือน"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-[var(--brand-contrast)] ring-2 ring-white"
                style={{ background: "var(--brand)" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="animate-fade-in absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border bg-white shadow-lg"
              style={{ borderColor: "var(--line)" }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="text-sm font-semibold text-[var(--ink)]">การแจ้งเตือน</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--brand-strong)] hover:underline"
                  >
                    <CheckCheck size={14} /> อ่านทั้งหมด
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover-tint)] ${
                        n.unread ? "bg-[var(--brand-tint)]/40" : ""
                      }`}
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-tint)] text-[var(--brand-strong)]">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-[var(--ink)]">{n.title}</div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">{n.time}</div>
                      </div>
                      {n.unread && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: "var(--brand)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
