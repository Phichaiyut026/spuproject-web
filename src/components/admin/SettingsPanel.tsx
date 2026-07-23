"use client";

import { useEffect, useState } from "react";
import { Settings2, Save } from "lucide-react";
import { Label, Input, Button, Alert } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { SysSetting } from "@/lib/types";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SysSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get<SysSetting[]>("/api/admin/settings")
      .then((data) => {
        setSettings(data);
        setValues(Object.fromEntries(data.map((s) => [s.settingKey, s.settingValue ?? ""])));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function save(key: string) {
    setSavingKey(key);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/admin/settings/${key}`, { value: values[key] });
      setSuccess(`บันทึกค่า "${key}" เรียบร้อยแล้ว`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="p-5">
      <h4 className="mb-1 flex items-center gap-2 text-base font-semibold text-[var(--ink)]">
        <Settings2 size={18} className="text-[var(--brand-strong)]" /> ตั้งค่าระบบ
      </h4>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        ค่าตั้งค่าเหล่านี้มีผลจริงต่อพฤติกรรมระบบ (เช่น จำนวนขั้นการอนุมัติที่ใช้ในระบบ SupportHouse)
      </p>

      {success && <Alert tone="success">{success}</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}

      {loading && <p className="text-sm text-[var(--text-muted)]">กำลังโหลด...</p>}

      <div className="space-y-4 max-w-2xl">
        {!loading &&
          settings.map((s) => (
            <div key={s.settingKey} className="rounded-lg border p-4" style={{ borderColor: "var(--line)" }}>
              <Label>{s.settingKey}</Label>
              {s.description && <p className="mb-2 text-xs text-[var(--text-muted)]">{s.description}</p>}
              <div className="flex gap-2">
                <Input
                  value={values[s.settingKey] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [s.settingKey]: e.target.value }))}
                />
                <Button onClick={() => save(s.settingKey)} disabled={savingKey === s.settingKey}>
                  <Save size={14} /> บันทึก
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
