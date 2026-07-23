"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Label, Input, Button, Alert } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { SysArea } from "@/lib/types";

function emptyForm() {
  return { areaCode: "", areaName: "", description: "" };
}

export default function AreasPanel() {
  const [areas, setAreas] = useState<SysArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get<SysArea[]>("/api/admin/areas")
      .then(setAreas)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(a: SysArea) {
    setEditing(a.areaCode);
    setShowAdd(false);
    setForm({ areaCode: a.areaCode, areaName: a.areaName, description: a.description ?? "" });
    setError("");
  }

  function startAdd() {
    setShowAdd(true);
    setEditing(null);
    setForm(emptyForm());
    setError("");
  }

  function cancel() {
    setEditing(null);
    setShowAdd(false);
    setError("");
  }

  async function save() {
    setError("");
    try {
      if (editing) {
        await api.put(`/api/admin/areas/${editing}`, { areaName: form.areaName, description: form.description });
      } else {
        await api.post("/api/admin/areas", form);
      }
      cancel();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ");
    }
  }

  async function remove(areaCode: string) {
    if (!confirm(`ลบพื้นที่ ${areaCode}?`)) return;
    try {
      await api.delete(`/api/admin/areas/${areaCode}`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--ink)]">
          <MapPin size={18} className="text-[var(--brand-strong)]" /> จัดการพื้นที่
        </h4>
        <Button onClick={startAdd}>
          <Plus size={15} /> เพิ่มพื้นที่
        </Button>
      </div>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Master data สำหรับโซน/พื้นที่ทางกายภาพ (เช่น โซนผลิต) ใช้เป็นข้อมูลอ้างอิงร่วมกันในระบบ
      </p>

      {error && <Alert tone="danger">{error}</Alert>}

      {(showAdd || editing) && (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: "var(--line)" }}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>รหัสพื้นที่</Label>
              <Input
                value={form.areaCode}
                disabled={!!editing}
                onChange={(e) => setForm((f) => ({ ...f, areaCode: e.target.value }))}
                placeholder="เช่น ZONE-A"
              />
            </div>
            <div>
              <Label>ชื่อพื้นที่</Label>
              <Input value={form.areaName} onChange={(e) => setForm((f) => ({ ...f, areaName: e.target.value }))} />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={save}>บันทึก</Button>
            <Button variant="outline" onClick={cancel}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-[var(--text-muted)]" style={{ borderColor: "var(--line)" }}>
            <th className="py-2">รหัส</th>
            <th className="py-2">ชื่อพื้นที่</th>
            <th className="py-2">คำอธิบาย</th>
            <th className="py-2 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">
                กำลังโหลด...
              </td>
            </tr>
          )}
          {!loading &&
            areas.map((a) => (
              <tr key={a.areaCode} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                <td className="py-2 font-medium">{a.areaCode}</td>
                <td className="py-2">{a.areaName}</td>
                <td className="py-2 text-[var(--text-muted)]">{a.description}</td>
                <td className="py-2 text-right">
                  <button onClick={() => startEdit(a)} className="mr-2 text-[var(--info)]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(a.areaCode)} className="text-[var(--danger)]">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          {!loading && areas.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">
                ยังไม่มีพื้นที่
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
