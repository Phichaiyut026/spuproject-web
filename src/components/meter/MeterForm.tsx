"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Select, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { MtrMeter } from "@/lib/types";

export default function MeterForm({ initial }: { initial?: MtrMeter }) {
  const router = useRouter();
  const isNew = !initial;
  const [form, setForm] = useState<{
    meterCode: string;
    meterName: string;
    location: string;
    installDate: string;
    status: string;
  }>({
    meterCode: initial?.meterCode ?? "",
    meterName: initial?.meterName ?? "",
    location: initial?.location ?? "",
    installDate: initial?.installDate ?? "",
    status: initial?.status ?? "Active",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isNew) {
        await api.post("/api/smart-meter/meters", form);
      } else {
        await api.put(`/api/smart-meter/meters/${initial!.meterCode}`, form);
      }
      router.push("/smart-meter/meters");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h3 className="text-xl font-bold mb-4">{isNew ? "เพิ่มมิเตอร์" : "แก้ไขมิเตอร์"}</h3>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>รหัสมิเตอร์</Label>
            <Input
              required
              maxLength={20}
              disabled={!isNew}
              value={form.meterCode}
              onChange={(e) => setForm((f) => ({ ...f, meterCode: e.target.value }))}
            />
          </div>
          <div>
            <Label>ชื่อ/จุดติดตั้งมิเตอร์</Label>
            <Input required value={form.meterName} onChange={(e) => setForm((f) => ({ ...f, meterName: e.target.value }))} />
          </div>
          <div>
            <Label>ตำแหน่งติดตั้ง</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <Label>วันที่ติดตั้ง</Label>
            <Input type="date" value={form.installDate} onChange={(e) => setForm((f) => ({ ...f, installDate: e.target.value }))} />
          </div>
          <div>
            <Label>สถานะ</Label>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              ✔ บันทึก
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(isNew ? "/new-task" : "/smart-meter/meters")}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
