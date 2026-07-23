"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Label, Input, Select, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { MtrMeter } from "@/lib/types";

export default function NewReadingPage() {
  const router = useRouter();
  const [meters, setMeters] = useState<MtrMeter[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [form, setForm] = useState({
    meterCode: "",
    readingDate: new Date().toISOString().slice(0, 10),
    timeSlot: "",
    kwhValue: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<MtrMeter[]>("/api/smart-meter/meters").then((data) => {
      setMeters(data);
      if (data.length > 0) setForm((f) => ({ ...f, meterCode: data[0].meterCode }));
    });
    api.get<string[]>("/api/smart-meter/time-slots").then((slots) => {
      setTimeSlots(slots);
      if (slots.length > 0) setForm((f) => ({ ...f, timeSlot: slots[0] }));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/smart-meter/readings", { ...form, kwhValue: Number(form.kwhValue) });
      router.push("/smart-meter");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <h3 className="text-xl font-bold mb-4">บันทึกค่าการใช้ไฟฟ้า</h3>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>มิเตอร์</Label>
            <Select required value={form.meterCode} onChange={(e) => setForm((f) => ({ ...f, meterCode: e.target.value }))}>
              {meters.map((m) => (
                <option key={m.meterCode} value={m.meterCode}>
                  {m.meterCode} - {m.meterName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>วันที่บันทึก</Label>
            <Input
              type="date"
              required
              value={form.readingDate}
              onChange={(e) => setForm((f) => ({ ...f, readingDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>ช่วงเวลา</Label>
            <Select required value={form.timeSlot} onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}>
              {timeSlots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ค่าพลังงานไฟฟ้า (kWh)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              required
              value={form.kwhValue}
              onChange={(e) => setForm((f) => ({ ...f, kwhValue: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              ✔ บันทึก
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/smart-meter")}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
