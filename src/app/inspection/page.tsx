"use client";

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, Badge, Table, LinkButton, Input, Select, Button } from "@/components/ui";
import { api, apiFileUrl } from "@/lib/api";
import { InspectionOrder } from "@/lib/types";

function statusTone(status: string) {
  if (status === "Passed") return "success" as const;
  if (status === "Failed") return "danger" as const;
  return "warning" as const;
}

export default function InspectionListPage() {
  const [orders, setOrders] = useState<InspectionOrder[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (status) params.set("status", status);
    api.get<InspectionOrder[]>(`/api/inspection?${params.toString()}`).then(setOrders);
  }, [keyword, status]);

  useEffect(() => {
    load();
  }, [load]);

  const exportUrl = apiFileUrl(
    `/api/inspection/export?keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}`
  );

  return (
    <AppShell>
      <PageHeader
        title="รายการตรวจสอบชิ้นงานแรก"
        subtitle="First Inspection Order List"
        action={
          <div className="flex gap-2">
            <a href={exportUrl}>
              <Button variant="outline">📊 ส่งออก Excel</Button>
            </a>
            <LinkButton href="/inspection/new">➕ เพิ่มรายการ</LinkButton>
          </div>
        }
      />

      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="ค้นหา เลขที่คำสั่ง/รหัสสินค้า/ชื่อสินค้า"
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[160px]">
          <option value="">ทุกสถานะ</option>
          <option value="Pending">Pending</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </Select>
        <Button type="submit" variant="outline">
          ค้นหา
        </Button>
      </form>

      <Table>
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
            <th className="px-4 py-3">เลขที่คำสั่งตรวจสอบ</th>
            <th className="px-4 py-3">รหัสสินค้า</th>
            <th className="px-4 py-3">ชื่อสินค้า</th>
            <th className="px-4 py-3">วันที่ตรวจสอบ</th>
            <th className="px-4 py-3">ผู้ตรวจสอบ</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3">ผู้สร้างรายการ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
              <td className="px-4 py-3">{o.orderNo}</td>
              <td className="px-4 py-3">{o.productCode}</td>
              <td className="px-4 py-3">{o.productName}</td>
              <td className="px-4 py-3">{o.inspectionDate}</td>
              <td className="px-4 py-3">{o.inspectorName}</td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(o.status)}>{o.status}</Badge>
              </td>
              <td className="px-4 py-3">{o.createdByName}</td>
              <td className="px-4 py-3">
                <a href={`/inspection/${o.orderId}/edit`} className="text-sm font-medium text-[var(--ink)] hover:underline">
                  แก้ไข
                </a>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-[var(--text-muted)] py-8">
                ไม่พบรายการ
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </AppShell>
  );
}
