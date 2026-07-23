"use client";

import AppShell from "@/components/AppShell";
import { PageHeader, Table } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { canAccessModule } from "@/lib/permissions";

const NEW_TASK_ROWS = [
  { category: "คุณภาพ (QC)", name: "ระบบรายการตรวจสอบชิ้นงานแรก - First Inspection Order", href: "/inspection/new", module: "inspection" },
  { category: "อนุมัติงาน", name: "SupportHouse - คำขออนุมัติงาน", href: "/approval/new", module: "approval" },
  { category: "รายงาน", name: "รายงานผลการปฏิบัติงานประจำสัปดาห์", href: "/weekly/new", module: "weekly" },
  { category: "Smart Meter", name: "บันทึกค่าการใช้ไฟฟ้าจากมิเตอร์อัจฉริยะ", href: "/smart-meter/readings/new", module: "smart-meter" },
  { category: "Smart Meter", name: "เพิ่มมิเตอร์ไฟฟ้าใหม่เข้าระบบ", href: "/smart-meter/meters/new", module: "smart-meter" },
];

export default function NewTaskPage() {
  const { user } = useAuth();
  const rows = NEW_TASK_ROWS.filter((row) => canAccessModule(user, row.module));

  return (
    <AppShell>
      <PageHeader title="New task" />

      <Table>
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "var(--line)" }}>
            <th className="p-3">Category</th>
            <th className="p-3">Name</th>
            <th className="p-3 w-40">Operation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.href} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
              <td className="p-3">{row.category}</td>
              <td className="p-3">{row.name}</td>
              <td className="p-3">
                <a href={row.href} className="text-sm font-medium text-[var(--ink)] hover:underline">
                  Startup process
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AppShell>
  );
}
