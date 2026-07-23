"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label, Input, Textarea, Select, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ReportItemCategory, UserOption, WeeklyReportItem, WeeklyReportLineItem } from "@/lib/types";

const CATEGORY_LABEL: Record<ReportItemCategory, string> = {
  WorkSummary: "Personal work summary",
  CompetencyTraining: "Competency training",
};

function emptyLineItem(category: ReportItemCategory): WeeklyReportLineItem {
  return { category, content: "", weight: "", completion: "", supervisorRating: "", supervisorAdvice: "" };
}

export default function WeeklyForm({
  initial,
  defaults,
  editable,
}: {
  initial?: WeeklyReportItem;
  defaults?: { reportWeek: number; reportYear: number; dateFrom: string; dateTo: string };
  editable: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [form, setForm] = useState({
    reportWeek: initial?.reportWeek ?? defaults?.reportWeek ?? 1,
    reportYear: initial?.reportYear ?? defaults?.reportYear ?? new Date().getFullYear(),
    content: initial?.content ?? "",
    personnelCategory: initial?.personnelCategory ?? "Probationary",
    dateFrom: initial?.dateFrom ?? defaults?.dateFrom ?? "",
    dateTo: initial?.dateTo ?? defaults?.dateTo ?? "",
    supervisorId: initial?.supervisorId ?? "",
  });
  const [items, setItems] = useState<WeeklyReportLineItem[]>(initial?.items ?? []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<UserOption[]>("/api/weekly/users").then(setUsers);
  }, []);

  function addItem(category: ReportItemCategory) {
    setItems((prev) => [...prev, emptyLineItem(category)]);
  }

  function updateItem(index: number, field: keyof WeeklyReportLineItem, value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save(action: "draft" | "submit") {
    setSubmitting(true);
    try {
      await api.post(`/api/weekly?action=${action}`, {
        reportId: initial?.reportId,
        reportWeek: Number(form.reportWeek),
        reportYear: Number(form.reportYear),
        content: form.content,
        personnelCategory: form.personnelCategory,
        dateFrom: form.dateFrom || null,
        dateTo: form.dateTo || null,
        supervisorId: form.supervisorId || null,
        items,
      });
      router.push("/weekly");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const title = !initial ? "Trial Period Weekly Report" : editable ? "Trial Period Weekly Report" : `Weekly Report of ${initial.userName}`;

  return (
    <>
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      {/* แถบข้อมูลผู้กรอก */}
      <Card className="mb-4 overflow-hidden">
        <div className="grid grid-cols-4 text-sm">
          <div className="border-b border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Filler</div>
          <div className="border-b border-r p-2" style={{ borderColor: "var(--line)" }}>{initial?.userName ?? user?.realName}</div>
          <div className="border-b border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Department</div>
          <div className="border-b p-2" style={{ borderColor: "var(--line)" }}>{initial?.userDeptCode ?? "-"}</div>

          <div className="border-b border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Grade and rank</div>
          <div className="border-b border-r p-2 text-[var(--text-muted)]" style={{ borderColor: "var(--line)" }}>-</div>
          <div className="border-b border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Position</div>
          <div className="border-b p-2 text-[var(--text-muted)]" style={{ borderColor: "var(--line)" }}>-</div>

          <div className="border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Personnel category</div>
          <div className="border-r p-2 flex items-center gap-4" style={{ borderColor: "var(--line)" }}>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="personnelCategory"
                disabled={!editable}
                checked={form.personnelCategory === "Probationary"}
                onChange={() => setForm((f) => ({ ...f, personnelCategory: "Probationary" }))}
              />
              probationary staff
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="personnelCategory"
                disabled={!editable}
                checked={form.personnelCategory === "JobChange"}
                onChange={() => setForm((f) => ({ ...f, personnelCategory: "JobChange" }))}
              />
              Job change personnel
            </label>
          </div>
          <div className="border-r p-2 font-semibold" style={{ borderColor: "var(--line)" }}>Fill in the date</div>
          <div className="p-2 flex items-center gap-2">
            <Input type="date" disabled={!editable} value={form.dateFrom} onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))} />
            <span>--</span>
            <Input type="date" disabled={!editable} value={form.dateTo} onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))} />
          </div>
        </div>
      </Card>

      {/* ผู้บังคับบัญชา */}
      <Card className="mb-4 p-4">
        <Label>หัวหน้างาน / ผู้จัดการ (Supervisor / Manager)</Label>
        <Select
          disabled={!editable}
          value={form.supervisorId}
          onChange={(e) => setForm((f) => ({ ...f, supervisorId: e.target.value }))}
          className="max-w-sm"
        >
          <option value="">-- เลือกหัวหน้างาน --</option>
          {users.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.realName}
            </option>
          ))}
        </Select>
      </Card>

      {/* ตารางรายการงาน */}
      <Card className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--line)" }}>
              <th className="p-2 w-10">#</th>
              <th className="p-2">Content</th>
              <th className="p-2 w-24">Weight</th>
              <th className="p-2 w-28">Completion</th>
              <th className="p-2 w-32">Supervisor rating</th>
              <th className="p-2 w-56">Supervisor advice / opinion</th>
              {editable && <th className="p-2 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b align-top" style={{ borderColor: "var(--line)" }}>
                <td className="p-2">
                  {i + 1}
                  <div className="text-[10px] text-[var(--text-muted)]">{CATEGORY_LABEL[item.category]}</div>
                </td>
                <td className="p-2">
                  <Textarea rows={2} disabled={!editable} value={item.content} onChange={(e) => updateItem(i, "content", e.target.value)} />
                </td>
                <td className="p-2">
                  <Input disabled={!editable} value={item.weight} onChange={(e) => updateItem(i, "weight", e.target.value)} />
                </td>
                <td className="p-2">
                  <Input disabled={!editable} value={item.completion} onChange={(e) => updateItem(i, "completion", e.target.value)} />
                </td>
                <td className="p-2">
                  <Input disabled={!editable} value={item.supervisorRating} onChange={(e) => updateItem(i, "supervisorRating", e.target.value)} />
                </td>
                <td className="p-2">
                  <Textarea rows={2} disabled={!editable} value={item.supervisorAdvice} onChange={(e) => updateItem(i, "supervisorAdvice", e.target.value)} />
                </td>
                {editable && (
                  <td className="p-2">
                    <button type="button" className="text-[#a02121] text-xs" onClick={() => removeItem(i)}>
                      ลบ
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-[var(--text-muted)] py-4">
                  ยังไม่มีรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {editable && (
          <div className="flex gap-2 p-3">
            <Button variant="outline" onClick={() => addItem("WorkSummary")}>
              ➕ Personal work summary
            </Button>
            <Button variant="outline" onClick={() => addItem("CompetencyTraining")}>
              ➕ Competency training
            </Button>
          </div>
        )}
      </Card>

      {/* สรุปประสบการณ์ */}
      <Card className="mb-4">
        <div className="grid grid-cols-[200px_1fr]">
          <div className="p-3 font-semibold border-r" style={{ borderColor: "var(--line)" }}>
            Personal summary and experience
          </div>
          <div className="p-3">
            <Textarea rows={6} disabled={!editable} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-[200px_1fr] border-t" style={{ borderColor: "var(--line)" }}>
          <div className="p-3 font-semibold border-r" style={{ borderColor: "var(--line)" }}>
            Supervisor
          </div>
          <div className="p-3 text-[var(--text-muted)]">{initial?.supervisorName ?? "-"}</div>
        </div>
      </Card>

      <div className="flex gap-2 pt-2">
        {editable && (
          <>
            <Button variant="outline" disabled={submitting} onClick={() => save("draft")}>
              💾 บันทึกฉบับร่าง
            </Button>
            <Button disabled={submitting} onClick={() => save("submit")}>
              📨 ส่งรายงาน
            </Button>
          </>
        )}
        <Button variant="outline" onClick={() => router.push(initial ? "/weekly" : "/new-task")}>
          กลับ
        </Button>
      </div>
    </>
  );
}
