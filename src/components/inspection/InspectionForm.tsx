"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Select, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { InspectionOrder } from "@/lib/types";

export default function InspectionForm({ initial }: { initial?: InspectionOrder }) {
  const router = useRouter();
  const [form, setForm] = useState<{
    orderNo: string;
    productCode: string;
    productName: string;
    inspectionDate: string;
    inspectorName: string;
    status: string;
  }>({
    orderNo: initial?.orderNo ?? "",
    productCode: initial?.productCode ?? "",
    productName: initial?.productName ?? "",
    inspectionDate: initial?.inspectionDate ?? "",
    inspectorName: initial?.inspectorName ?? "",
    status: initial?.status ?? "Pending",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (initial) {
        await api.put(`/api/inspection/${initial.orderId}`, form);
      } else {
        await api.post("/api/inspection", form);
      }
      router.push("/inspection");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h3 className="text-xl font-bold mb-4">{initial ? "แก้ไขรายการตรวจสอบ" : "เพิ่มรายการตรวจสอบ"}</h3>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>เลขที่คำสั่งตรวจสอบ</Label>
            <Input required value={form.orderNo} onChange={update("orderNo")} />
          </div>
          <div>
            <Label>รหัสสินค้า</Label>
            <Input required value={form.productCode} onChange={update("productCode")} />
          </div>
          <div>
            <Label>ชื่อสินค้า</Label>
            <Input value={form.productName} onChange={update("productName")} />
          </div>
          <div>
            <Label>วันที่ตรวจสอบ</Label>
            <Input type="date" required value={form.inspectionDate} onChange={update("inspectionDate")} />
          </div>
          <div>
            <Label>ชื่อผู้ตรวจสอบ</Label>
            <Input value={form.inspectorName} onChange={update("inspectorName")} />
          </div>
          <div>
            <Label>สถานะ</Label>
            <Select value={form.status} onChange={update("status")}>
              <option value="Pending">Pending</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              ✔ บันทึก
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/inspection")}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
