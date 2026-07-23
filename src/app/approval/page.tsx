"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { PageHeader, Badge, Table, LinkButton, Select, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { ApprovalRequestItem } from "@/lib/types";

function statusInfo(status: string) {
  if (status === "Approved") return { tone: "success" as const, label: "อนุมัติแล้ว" };
  if (status === "Rejected") return { tone: "danger" as const, label: "ปฏิเสธ" };
  return { tone: "warning" as const, label: "รออนุมัติ" };
}

function ApprovalListContent() {
  const searchParams = useSearchParams();
  const mine = searchParams.get("mine") === "true";
  const isHistoricView = searchParams.get("view") === "historic";
  const [requests, setRequests] = useState<ApprovalRequestItem[]>([]);
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (mine) params.set("mine", "true");
    api.get<ApprovalRequestItem[]>(`/api/approval?${params.toString()}`).then((data) => {
      // "Historic task" = คำขอที่ดำเนินการเสร็จแล้ว (ไม่นับที่ยังรออนุมัติ)
      setRequests(isHistoricView && !status ? data.filter((r) => r.status !== "Pending") : data);
    });
  }, [status, mine, isHistoricView]);

  useEffect(() => {
    load();
  }, [load]);

  const title = mine ? "My process — คำขอที่ฉันยื่น" : isHistoricView ? "Historic task — ประวัติที่ดำเนินการเสร็จแล้ว" : "ระบบสนับสนุนการอนุมัติงาน";

  return (
    <>
      <PageHeader title={title} subtitle="SupportHouse" action={<LinkButton href="/approval/new">➕ ยื่นคำขอ</LinkButton>} />

      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]">
          <option value="">ทุกสถานะ</option>
          <option value="Pending">รออนุมัติ</option>
          <option value="Approved">อนุมัติแล้ว</option>
          <option value="Rejected">ปฏิเสธ</option>
        </Select>
        <Button type="submit" variant="outline">
          กรอง
        </Button>
      </form>

      <Table>
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
            <th className="px-4 py-3">รหัสคำขอ</th>
            <th className="px-4 py-3">ผู้ยื่นคำขอ</th>
            <th className="px-4 py-3">ประเภท</th>
            <th className="px-4 py-3">แผนก</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3">ขั้นปัจจุบัน</th>
            <th className="px-4 py-3">วันที่ยื่น</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const info = statusInfo(r.status);
            return (
              <tr key={r.requestId} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3">{r.requestId}</td>
                <td className="px-4 py-3">{r.requesterName}</td>
                <td className="px-4 py-3">{r.requestType}</td>
                <td className="px-4 py-3">{r.department}</td>
                <td className="px-4 py-3">
                  <Badge tone={info.tone}>{info.label}</Badge>
                </td>
                <td className="px-4 py-3">{r.status === "Pending" ? `ขั้นที่ ${r.currentLevel}` : "-"}</td>
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString("th-TH")}</td>
                <td className="px-4 py-3">
                  <a href={`/approval/${r.requestId}`} className="text-sm font-medium text-[var(--ink)] hover:underline">
                    รายละเอียด
                  </a>
                </td>
              </tr>
            );
          })}
          {requests.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-[var(--text-muted)] py-8">
                ไม่พบคำขอ
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

export default function ApprovalListPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ApprovalListContent />
      </Suspense>
    </AppShell>
  );
}
