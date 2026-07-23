"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Badge, Card, CardHeader, Button, Input, Alert } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { ApprovalDetail } from "@/lib/types";

function statusInfo(status: string, currentLevel: number | null, requiredLevels: number) {
  if (status === "Approved") return { tone: "success" as const, label: "อนุมัติแล้ว" };
  if (status === "Rejected") return { tone: "danger" as const, label: "ปฏิเสธ" };
  return { tone: "warning" as const, label: `รออนุมัติ (ขั้นที่ ${currentLevel} จาก ${requiredLevels})` };
}

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    api.get<ApprovalDetail>(`/api/approval/${params.id}`).then(setDetail);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action: "approve" | "reject") {
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/approval/${params.id}/${action}`, { comment });
      setSuccess(action === "approve" ? "อนุมัติคำขอเรียบร้อยแล้ว" : "ปฏิเสธคำขอเรียบร้อยแล้ว");
      setComment("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  if (!detail) return <AppShell>กำลังโหลด...</AppShell>;

  const { request, logs, isApprover, requiredLevels } = detail;
  const info = statusInfo(request.status, request.currentLevel, requiredLevels);

  return (
    <AppShell>
      <h3 className="text-xl font-bold mb-4">รายละเอียดคำขอ {request.requestId}</h3>

      {success && <Alert tone="success">{success}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      <Card className="mb-6">
        <CardHeader>ℹ️ ข้อมูลคำขอ</CardHeader>
        <div className="p-4 text-sm">
          <dl className="grid grid-cols-[140px_1fr] gap-y-2">
            <dt className="text-[var(--text-muted)]">ผู้ยื่นคำขอ</dt>
            <dd>{request.requesterName}</dd>
            <dt className="text-[var(--text-muted)]">ประเภทคำขอ</dt>
            <dd>{request.requestType}</dd>
            <dt className="text-[var(--text-muted)]">แผนก</dt>
            <dd>{request.department}</dd>
            <dt className="text-[var(--text-muted)]">รายละเอียด</dt>
            <dd>{request.requestDetail}</dd>
            <dt className="text-[var(--text-muted)]">สถานะ</dt>
            <dd>
              <Badge tone={info.tone}>{info.label}</Badge>
            </dd>
            <dt className="text-[var(--text-muted)]">วันที่ยื่น</dt>
            <dd>{new Date(request.createdAt).toLocaleString("th-TH")}</dd>
          </dl>
        </div>
      </Card>

      {isApprover && request.status === "Pending" && (
        <Card className="mb-6">
          <CardHeader>ดำเนินการอนุมัติ (ขั้นที่ {request.currentLevel})</CardHeader>
          <div className="p-4 space-y-3">
            <Input placeholder="ความเห็น / เหตุผล (ถ้ามี)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="success" disabled={submitting} onClick={() => act("approve")}>
                ✔ อนุมัติ
              </Button>
              <Button variant="outline-danger" disabled={submitting} onClick={() => act("reject")}>
                ✕ ปฏิเสธ
              </Button>
            </div>
          </div>
        </Card>
      )}

      <h6 className="text-sm text-[var(--text-muted)] mb-2">ประวัติการดำเนินการ</h6>
      <div className="overflow-x-auto bg-white border rounded-xl" style={{ borderColor: "var(--line)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
              <th className="px-3 py-2">ลำดับขั้น</th>
              <th className="px-3 py-2">ผู้ดำเนินการ</th>
              <th className="px-3 py-2">การกระทำ</th>
              <th className="px-3 py-2">ความเห็น</th>
              <th className="px-3 py-2">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.logId} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                <td className="px-3 py-2">{log.approvalLevel}</td>
                <td className="px-3 py-2">{log.approverName}</td>
                <td className="px-3 py-2">
                  <Badge tone={log.action === "Approve" ? "success" : "danger"}>
                    {log.action === "Approve" ? "อนุมัติ" : "ปฏิเสธ"}
                  </Badge>
                </td>
                <td className="px-3 py-2">{log.comment}</td>
                <td className="px-3 py-2">{new Date(log.actionDate).toLocaleString("th-TH")}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-6">
                  ยังไม่มีการดำเนินการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Button variant="outline" onClick={() => history.back()}>
          กลับ
        </Button>
      </div>
    </AppShell>
  );
}
