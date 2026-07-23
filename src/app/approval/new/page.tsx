"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Label, Input, Textarea, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";

export default function NewApprovalPage() {
  const router = useRouter();
  const [form, setForm] = useState({ requestType: "", department: "", requestDetail: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/approval", form);
      router.push("/approval");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <h3 className="text-xl font-bold mb-4">ยื่นคำขออนุมัติ</h3>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>ประเภทคำขอ</Label>
            <Input
              required
              placeholder="เช่น ขอเบิกอุปกรณ์, ขออนุมัติซ่อมบำรุง"
              value={form.requestType}
              onChange={(e) => setForm((f) => ({ ...f, requestType: e.target.value }))}
            />
          </div>
          <div>
            <Label>แผนกที่เกี่ยวข้อง</Label>
            <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
          </div>
          <div>
            <Label>รายละเอียดคำขอ</Label>
            <Textarea
              required
              rows={5}
              value={form.requestDetail}
              onChange={(e) => setForm((f) => ({ ...f, requestDetail: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              📨 ยื่นคำขอ
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/approval")}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
