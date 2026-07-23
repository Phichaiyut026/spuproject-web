"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, Badge, Table, LinkButton, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { MtrMeter } from "@/lib/types";

export default function MeterListPage() {
  const [meters, setMeters] = useState<MtrMeter[]>([]);

  const load = useCallback(() => {
    api.get<MtrMeter[]>("/api/smart-meter/meters").then(setMeters);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(meterCode: string) {
    if (!confirm(`ยืนยันการลบมิเตอร์ ${meterCode}?`)) return;
    try {
      await api.delete(`/api/smart-meter/meters/${meterCode}`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="ข้อมูลมิเตอร์ไฟฟ้า"
        action={
          <div className="flex gap-2">
            <LinkButton href="/smart-meter" variant="outline">
              ← กลับแดชบอร์ด
            </LinkButton>
            <LinkButton href="/smart-meter/meters/new">➕ เพิ่มมิเตอร์</LinkButton>
          </div>
        }
      />

      <Table>
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
            <th className="px-4 py-3">รหัสมิเตอร์</th>
            <th className="px-4 py-3">ชื่อ/จุดติดตั้ง</th>
            <th className="px-4 py-3">ตำแหน่ง</th>
            <th className="px-4 py-3">วันที่ติดตั้ง</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {meters.map((m) => (
            <tr key={m.meterCode} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
              <td className="px-4 py-3">{m.meterCode}</td>
              <td className="px-4 py-3">{m.meterName}</td>
              <td className="px-4 py-3">{m.location}</td>
              <td className="px-4 py-3">{m.installDate}</td>
              <td className="px-4 py-3">
                <Badge tone={m.status === "Active" ? "success" : "secondary"}>{m.status}</Badge>
              </td>
              <td className="px-4 py-3 flex gap-2">
                <a href={`/smart-meter/meters/${m.meterCode}/edit`} className="text-sm font-medium text-[var(--ink)] hover:underline">
                  แก้ไข
                </a>
                <Button variant="outline-danger" className="px-2 py-1 text-xs" onClick={() => handleDelete(m.meterCode)}>
                  ลบ
                </Button>
              </td>
            </tr>
          ))}
          {meters.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-[var(--text-muted)] py-8">
                ยังไม่มีมิเตอร์
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </AppShell>
  );
}
