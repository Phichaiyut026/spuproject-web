"use client";

import { useEffect, useState } from "react";
import { ScrollText, RefreshCw, FileSpreadsheet, BadgeCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui";
import { api } from "@/lib/api";
import { ActivityLogEntry } from "@/lib/types";

const TYPE_INFO: Record<ActivityLogEntry["type"], { label: string; tone: "primary" | "success" | "info"; icon: typeof FileSpreadsheet }> = {
  Export: { label: "ส่งออกไฟล์", tone: "primary", icon: FileSpreadsheet },
  Approval: { label: "อนุมัติงาน", tone: "success", icon: BadgeCheck },
  MeterView: { label: "ดู Smart Meter", tone: "info", icon: Zap },
};

export default function ActivityLogPanel() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<ActivityLogEntry[]>("/api/admin/activity-log?limit=100")
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--ink)]">
            <ScrollText size={18} className="text-[var(--brand-strong)]" /> บันทึกการใช้งาน
          </h4>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            รวมจากประวัติจริงในระบบ: ส่งออกไฟล์ (Inspection), อนุมัติงาน (SupportHouse), เข้าดูรายงาน (Smart Meter)
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
          style={{ borderColor: "var(--line-strong)" }}
        >
          <RefreshCw size={15} /> รีเฟรช
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-[var(--text-muted)]" style={{ borderColor: "var(--line)" }}>
            <th className="py-2">ประเภท</th>
            <th className="py-2">ผู้ใช้งาน</th>
            <th className="py-2">รายละเอียด</th>
            <th className="py-2">เวลา</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">
                กำลังโหลด...
              </td>
            </tr>
          )}
          {!loading &&
            entries.map((e, i) => {
              const info = TYPE_INFO[e.type];
              const Icon = info.icon;
              return (
                <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <td className="py-2">
                    <Badge tone={info.tone}>
                      <Icon size={12} className="mr-1 inline" />
                      {info.label}
                    </Badge>
                  </td>
                  <td className="py-2">{e.userName ?? "-"}</td>
                  <td className="py-2">{e.detail}</td>
                  <td className="py-2 text-[var(--text-muted)]">{new Date(e.occurredAt).toLocaleString("th-TH")}</td>
                </tr>
              );
            })}
          {!loading && entries.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">
                ยังไม่มีบันทึกการใช้งาน
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
