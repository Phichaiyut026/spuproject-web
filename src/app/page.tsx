"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";

const STAT_TILES = [
  { key: "pendingInspectionCount", icon: "📋", label: "รอตรวจสอบชิ้นงาน" },
  { key: "pendingApprovalCount", icon: "⏳", label: "คำขอรออนุมัติ" },
  { key: "weeklyReportCount", icon: "📝", label: "รายงานประจำสัปดาห์" },
  { key: "meterCount", icon: "⚡", label: "มิเตอร์ไฟฟ้าในระบบ" },
] as const;

const QUICK_LINKS = [
  { href: "/inspection", icon: "📋", title: "ตรวจสอบชิ้นงานแรก", desc: "ดูรายการและส่งออก Excel" },
  { href: "/approval", icon: "✅", title: "อนุมัติงาน", desc: "ยื่นคำขอ / ติดตามสถานะ" },
  { href: "/weekly", icon: "📝", title: "รายงานประจำสัปดาห์", desc: "บันทึกผลการปฏิบัติงาน" },
  { href: "/smart-meter", icon: "⚡", title: "Smart Meter", desc: "แดชบอร์ดข้อมูลไฟฟ้า" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/api/dashboard/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="แดชบอร์ด"
        subtitle="ภาพรวมระบบจัดการกระบวนการทำงานสำนักงาน — บริษัท ไทย หมิง ไลท์ติ้ง จำกัด"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_TILES.map((t) => (
          <div
            key={t.key}
            className="bg-white border rounded-xl shadow-sm p-5 flex items-center gap-4"
            style={{ borderColor: "var(--line)" }}
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-xl"
              style={{ background: "var(--hover-tint)" }}
            >
              {t.icon}
            </div>
            <div>
              <div className="text-2xl font-bold leading-none">{stats ? stats[t.key] : "…"}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h6 className="text-sm text-[var(--text-muted)] mb-3">เมนูลัด</h6>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map((q) => (
          <a
            key={q.href}
            href={q.href}
            className="bg-white border rounded-xl shadow-sm p-5 hover:shadow transition-shadow"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="text-2xl mb-2">{q.icon}</div>
            <h6 className="font-bold mb-1">{q.title}</h6>
            <p className="text-sm text-[var(--text-muted)]">{q.desc}</p>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
