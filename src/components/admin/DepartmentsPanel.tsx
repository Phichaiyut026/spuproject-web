"use client";

import { Fragment, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Label, Input, Button, Alert } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { SysDepartment, UserInfo } from "@/lib/types";

function emptyForm() {
  return { deptCode: "", deptName: "", description: "" };
}

export default function DepartmentsPanel() {
  const [depts, setDepts] = useState<SysDepartment[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([api.get<SysDepartment[]>("/api/admin/departments"), api.get<UserInfo[]>("/api/admin/users")])
      .then(([d, u]) => {
        setDepts(d);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function membersOf(deptCode: string) {
    return users.filter((u) => u.deptCode === deptCode);
  }

  function startEdit(d: SysDepartment) {
    setEditing(d.deptCode);
    setShowAdd(false);
    setForm({ deptCode: d.deptCode, deptName: d.deptName, description: d.description ?? "" });
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
        await api.put(`/api/admin/departments/${editing}`, { deptName: form.deptName, description: form.description });
      } else {
        await api.post("/api/admin/departments", form);
      }
      cancel();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ");
    }
  }

  async function remove(deptCode: string) {
    if (!confirm(`ลบหน่วยงาน ${deptCode}?`)) return;
    try {
      await api.delete(`/api/admin/departments/${deptCode}`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--ink)]">
          <Building2 size={18} className="text-[var(--brand-strong)]" /> หน่วยงาน / องค์กร
        </h4>
        <Button onClick={startAdd}>
          <Plus size={15} /> เพิ่มหน่วยงาน
        </Button>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {(showAdd || editing) && (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: "var(--line)" }}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>รหัสหน่วยงาน</Label>
              <Input
                value={form.deptCode}
                disabled={!!editing}
                onChange={(e) => setForm((f) => ({ ...f, deptCode: e.target.value }))}
                placeholder="เช่น IT, HR, QC"
              />
            </div>
            <div>
              <Label>ชื่อหน่วยงาน</Label>
              <Input value={form.deptName} onChange={(e) => setForm((f) => ({ ...f, deptName: e.target.value }))} />
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
            <th className="py-2 w-6"></th>
            <th className="py-2">รหัส</th>
            <th className="py-2">ชื่อหน่วยงาน</th>
            <th className="py-2">คำอธิบาย</th>
            <th className="py-2">พนักงาน</th>
            <th className="py-2 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                กำลังโหลด...
              </td>
            </tr>
          )}
          {!loading &&
            depts.map((d) => {
              const members = membersOf(d.deptCode);
              const isOpen = expanded === d.deptCode;
              return (
                <Fragment key={d.deptCode}>
                  <tr className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                    <td className="py-2">
                      <button
                        onClick={() => setExpanded(isOpen ? null : d.deptCode)}
                        className="text-[var(--text-muted)]"
                        disabled={members.length === 0}
                      >
                        {members.length > 0 && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                      </button>
                    </td>
                    <td className="py-2 font-medium">{d.deptCode}</td>
                    <td className="py-2">{d.deptName}</td>
                    <td className="py-2 text-[var(--text-muted)]">{d.description}</td>
                    <td className="py-2">
                      <button
                        onClick={() => setExpanded(isOpen ? null : d.deptCode)}
                        className="rounded-full bg-[var(--brand-tint)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-strong)]"
                      >
                        {members.length} คน
                      </button>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => startEdit(d)} className="mr-2 text-[var(--info)]">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(d.deptCode)} className="text-[var(--danger)]">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                      <td colSpan={6} className="bg-[var(--hover-tint)] px-6 py-3">
                        {members.length === 0 ? (
                          <span className="text-xs text-[var(--text-muted)]">ยังไม่มีพนักงานในหน่วยงานนี้</span>
                        ) : (
                          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                            {members.map((m) => (
                              <li key={m.userId} className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-[var(--ink)]">{m.realName}</span>
                                <span className="text-[var(--text-muted)]">({m.username})</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          {!loading && depts.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                ยังไม่มีหน่วยงาน
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
