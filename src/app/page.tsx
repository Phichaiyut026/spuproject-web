"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Hourglass,
  FileText,
  Zap,
  BadgeCheck,
  FilePlus2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { DashboardStats } from "@/lib/types";

const STAT_TILES: {
  key: keyof DashboardStats;
  icon: LucideIcon;
  label: string;
  href: string;
  accent: string;
  tint: string;
}[] = [
  {
    key: "pendingInspectionCount",
    icon: ClipboardCheck,
    label: "รอตรวจสอบชิ้นงาน",
    href: "/inspection",
    accent: "var(--info)",
    tint: "var(--info-tint)",
  },
  {
    key: "pendingApprovalCount",
    icon: Hourglass,
    label: "คำขอรออนุมัติ",
    href: "/approval?status=Pending",
    accent: "var(--warning)",
    tint: "var(--warning-tint)",
  },
  {
    key: "weeklyReportCount",
    icon: FileText,
    label: "รายงานประจำสัปดาห์",
    href: "/weekly",
    accent: "var(--success)",
    tint: "var(--success-tint)",
  },
  {
    key: "meterCount",
    icon: Zap,
    label: "มิเตอร์ไฟฟ้าในระบบ",
    href: "/smart-meter",
    accent: "var(--brand-strong)",
    tint: "var(--brand-tint)",
  },
];

const QUICK_LINKS: { href: string; icon: LucideIcon; title: string; desc: string }[] = [
  { href: "/inspection", icon: ClipboardCheck, title: "ตรวจสอบชิ้นงานแรก", desc: "ดูรายการและส่งออก Excel" },
  { href: "/approval", icon: BadgeCheck, title: "อนุมัติงาน", desc: "ยื่นคำขอ / ติดตามสถานะ" },
  { href: "/weekly", icon: FileText, title: "รายงานประจำสัปดาห์", desc: "บันทึกผลการปฏิบัติงาน" },
  { href: "/smart-meter", icon: Zap, title: "Smart Meter", desc: "แดชบอร์ดข้อมูลไฟฟ้า" },
];

function todayLabel() {
  return new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/api/dashboard/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <AppShell>
      {/* welcome banner */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl px-6 py-7 text-white md:px-8"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="text-sm text-white/60">{todayLabel()}</div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl text-balance">
            สวัสดี, {user?.realName ?? "ผู้ใช้งาน"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            ภาพรวมระบบจัดการกระบวนการทำงานสำนักงาน — บริษัท ไทย หมิง ไลท์ติ้ง จำกัด
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/new-task"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold"
              style={{ background: "var(--brand)", color: "var(--brand-contrast)" }}
            >
              <FilePlus2 size={16} /> สร้างงานใหม่
            </Link>
            <Link
              href="/approval?status=Pending"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Hourglass size={16} /> งานที่ต้องทำ
            </Link>
          </div>
        </div>
      </div>

      {/* stat tiles */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={t.href}
              className="group flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: t.tint, color: t.accent }}
                >
                  <Icon size={22} />
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold leading-none text-[var(--ink)]">
                  {stats ? stats[t.key] : "…"}
                </div>
                <div className="mt-1.5 text-sm text-[var(--text-muted)]">{t.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* quick links */}
      <div className="mb-3 flex items-center justify-between">
        <h6 className="text-sm font-semibold text-[var(--ink)]">เมนูลัด</h6>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "var(--line)" }}
            >
              <div
                className="mb-3 grid h-10 w-10 place-items-center rounded-lg"
                style={{ background: "var(--brand-tint)", color: "var(--brand-strong)" }}
              >
                <Icon size={20} />
              </div>
              <h6 className="mb-1 font-semibold text-[var(--ink)]">{q.title}</h6>
              <p className="text-sm text-[var(--text-muted)]">{q.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-strong)]">
                เปิด <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
