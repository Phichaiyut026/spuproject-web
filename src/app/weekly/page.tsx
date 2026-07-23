"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, Badge, Table, LinkButton, Input, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { WeeklyReportItem } from "@/lib/types";

export default function WeeklyListPage() {
  const [reports, setReports] = useState<WeeklyReportItem[]>([]);
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (week) params.set("week", week);
    api.get<WeeklyReportItem[]>(`/api/weekly?${params.toString()}`).then(setReports);
  }, [year, week]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <PageHeader
        title="รายงานผลการปฏิบัติงานประจำสัปดาห์"
        action={<LinkButton href="/weekly/new">📝 เขียนรายงาน</LinkButton>}
      />

      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input type="number" placeholder="ปี (ค.ศ.)" value={year} onChange={(e) => setYear(e.target.value)} className="max-w-[140px]" />
        <Input type="number" placeholder="สัปดาห์ที่" value={week} onChange={(e) => setWeek(e.target.value)} className="max-w-[140px]" />
        <Button type="submit" variant="outline">
          กรอง
        </Button>
      </form>

      <Table>
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
            <th className="px-4 py-3">รหัสรายงาน</th>
            <th className="px-4 py-3">ผู้จัดทำ</th>
            <th className="px-4 py-3">สัปดาห์ที่</th>
            <th className="px-4 py-3">ปี</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3">แก้ไขล่าสุด</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.reportId} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
              <td className="px-4 py-3">{r.reportId}</td>
              <td className="px-4 py-3">{r.userName}</td>
              <td className="px-4 py-3">{r.reportWeek}</td>
              <td className="px-4 py-3">{r.reportYear}</td>
              <td className="px-4 py-3">
                <Badge tone={r.status === "Submitted" ? "success" : "secondary"}>
                  {r.status === "Submitted" ? "ส่งแล้ว" : "ฉบับร่าง"}
                </Badge>
              </td>
              <td className="px-4 py-3">{new Date(r.updatedAt ?? r.createdAt).toLocaleString("th-TH")}</td>
              <td className="px-4 py-3">
                <a href={`/weekly/${r.reportId}`} className="text-sm font-medium text-[var(--ink)] hover:underline">
                  เปิดดู
                </a>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-[var(--text-muted)] py-8">
                ยังไม่มีรายงาน
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </AppShell>
  );
}
