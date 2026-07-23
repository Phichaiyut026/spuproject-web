"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Save, RefreshCw, Plus, Trash2, Users } from "lucide-react";
import { Button, Alert, Label, Input } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SysRole, SysPermission, RolePermissionPair } from "@/lib/types";

function emptyRoleForm() {
  return { roleCode: "", roleName: "", description: "" };
}

const MODULE_LABEL: Record<string, string> = {
  admin: "จัดการระบบ",
  approval: "อนุมัติงาน (SupportHouse)",
  inspection: "ตรวจสอบชิ้นงาน",
  weekly: "รายงานประจำสัปดาห์",
  "smart-meter": "Smart Meter",
};

function key(roleCode: string, permissionCode: string) {
  return `${roleCode}|${permissionCode}`;
}

export default function PermissionsPanel() {
  const { refresh: refreshSession } = useAuth();
  const [roles, setRoles] = useState<SysRole[]>([]);
  const [permissions, setPermissions] = useState<SysPermission[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);
  const [roleForm, setRoleForm] = useState(emptyRoleForm());
  const [roleError, setRoleError] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      api.get<SysRole[]>("/api/admin/permissions/roles"),
      api.get<SysPermission[]>("/api/admin/permissions/list"),
      api.get<RolePermissionPair[]>("/api/admin/permissions/matrix"),
    ])
      .then(([r, p, m]) => {
        setRoles(r);
        setPermissions(p);
        setChecked(new Set(m.map((pair) => key(pair.roleCode, pair.permissionCode))));
        setSelectedRoleCode((prev) => prev ?? r[0]?.roleCode ?? null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const grouped = useMemo(() => {
    const groups: Record<string, SysPermission[]> = {};
    for (const p of permissions) {
      const mod = p.module ?? "อื่นๆ";
      groups[mod] = groups[mod] ?? [];
      groups[mod].push(p);
    }
    return groups;
  }, [permissions]);

  const selectedRole = roles.find((r) => r.roleCode === selectedRoleCode) ?? null;

  function toggle(roleCode: string, permissionCode: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      const k = key(roleCode, permissionCode);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  }

  async function save() {
    if (!selectedRoleCode) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const permissionCodes = permissions
        .filter((p) => checked.has(key(selectedRoleCode, p.permissionCode)))
        .map((p) => p.permissionCode);
      await api.put(`/api/admin/permissions/roles/${selectedRoleCode}`, { permissionCodes });
      setSuccess(`บันทึกสิทธิ์ของ "${selectedRole?.roleName}" เรียบร้อยแล้ว`);
      load();
      refreshSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function startAddRole() {
    setShowAddRole(true);
    setRoleForm(emptyRoleForm());
    setRoleError("");
  }

  function cancelAddRole() {
    setShowAddRole(false);
    setRoleError("");
  }

  async function saveRole() {
    setRoleError("");
    setSavingRole(true);
    try {
      await api.post("/api/admin/permissions/roles", roleForm);
      setShowAddRole(false);
      setSelectedRoleCode(roleForm.roleCode);
      load();
    } catch (err) {
      setRoleError(err instanceof ApiError ? err.message : "เพิ่ม Role ไม่สำเร็จ");
    } finally {
      setSavingRole(false);
    }
  }

  async function removeRole(role: SysRole) {
    if (!confirm(`ต้องการลบ Role "${role.roleName}" ใช่หรือไม่?`)) return;
    try {
      await api.delete(`/api/admin/permissions/roles/${role.roleCode}`);
      if (selectedRoleCode === role.roleCode) setSelectedRoleCode(null);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "ลบ Role ไม่สำเร็จ");
    }
  }

  return (
    <div className="p-5">
      <div className="mb-4">
        <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--ink)]">
          <KeyRound size={18} className="text-[var(--brand-strong)]" /> สิทธิ์การใช้งาน
        </h4>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          เลือก role ทางซ้าย แล้วติ๊กว่าเข้าใช้งาน/กรอกฟอร์มโมดูลใดได้บ้าง มีผลจริงกับทุกฟอร์มในระบบ
        </p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">กำลังโหลด...</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Role list — เลือก role ก่อนจะกำหนดสิทธิ์ */}
          <div
            className="w-full shrink-0 overflow-y-auto rounded-lg border p-3 lg:w-64"
            style={{ borderColor: "var(--line)", maxHeight: "calc(100vh - 320px)" }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h5 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                <Users size={16} className="text-[var(--brand-strong)]" /> Role ในระบบ
              </h5>
              <button
                type="button"
                onClick={startAddRole}
                disabled={showAddRole}
                className="rounded-md p-1.5 text-[var(--brand-strong)] hover:bg-[var(--brand-tint)] disabled:opacity-40"
                title="เพิ่ม Role"
              >
                <Plus size={16} />
              </button>
            </div>

            {roleError && <Alert tone="danger">{roleError}</Alert>}

            {showAddRole && (
              <div className="mb-3 space-y-2 rounded-lg border p-3" style={{ borderColor: "var(--line)" }}>
                <div>
                  <Label>รหัส Role</Label>
                  <Input
                    value={roleForm.roleCode}
                    onChange={(e) => setRoleForm((f) => ({ ...f, roleCode: e.target.value }))}
                    placeholder="เช่น R004"
                  />
                </div>
                <div>
                  <Label>ชื่อ Role</Label>
                  <Input
                    value={roleForm.roleName}
                    onChange={(e) => setRoleForm((f) => ({ ...f, roleName: e.target.value }))}
                    placeholder="เช่น Auditor"
                  />
                </div>
                <div>
                  <Label>คำอธิบาย</Label>
                  <Input
                    value={roleForm.description}
                    onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveRole} disabled={savingRole}>
                    {savingRole ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                  <Button variant="outline" onClick={cancelAddRole}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {roles.map((r) => {
                const active = r.roleCode === selectedRoleCode;
                return (
                  <div
                    key={r.roleCode}
                    onClick={() => setSelectedRoleCode(r.roleCode)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[var(--brand-tint)] font-semibold text-[var(--brand-strong)]"
                        : "text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
                    }`}
                  >
                    <span>
                      {r.roleName} <span className="text-xs text-[var(--text-muted)]">({r.roleCode})</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRole(r);
                      }}
                      className="rounded-full p-1 text-[var(--danger)] hover:bg-[var(--danger-tint)]"
                      title={`ลบ ${r.roleName}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {roles.length === 0 && <span className="text-sm text-[var(--text-muted)]">ยังไม่มี Role ในระบบ</span>}
            </div>
          </div>

          {/* Permission checklist ของ role ที่เลือก */}
          <div className="min-w-0 flex-1 rounded-lg border p-4" style={{ borderColor: "var(--line)" }}>
            {!selectedRole ? (
              <p className="text-sm text-[var(--text-muted)]">เลือก role ทางซ้ายเพื่อกำหนดสิทธิ์การใช้งาน</p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-[var(--ink)]">
                      สิทธิ์ของ <span className="text-[var(--brand-strong)]">{selectedRole.roleName}</span>
                    </h5>
                    {selectedRole.description && (
                      <p className="text-xs text-[var(--text-muted)]">{selectedRole.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={load}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
                      style={{ borderColor: "var(--line-strong)" }}
                    >
                      <RefreshCw size={14} /> รีเฟรช
                    </button>
                    <Button onClick={save} disabled={saving}>
                      <Save size={14} /> {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
                  {Object.entries(grouped).map(([mod, perms]) => (
                    <div key={mod}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">
                        {MODULE_LABEL[mod] ?? mod}
                      </p>
                      <div className="divide-y rounded-lg border" style={{ borderColor: "var(--line)" }}>
                        {perms.map((p) => (
                          <label
                            key={p.permissionCode}
                            className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 hover:bg-[var(--hover-tint)]"
                            style={{ borderColor: "var(--line)" }}
                          >
                            <div>
                              <div className="text-sm font-medium text-[var(--ink)]">{p.permissionName}</div>
                              <div className="text-xs text-[var(--text-muted)]">{p.permissionCode}</div>
                            </div>
                            <input
                              type="checkbox"
                              className="h-4 w-4 shrink-0 accent-[var(--brand)]"
                              checked={checked.has(key(selectedRoleCode!, p.permissionCode))}
                              onChange={() => toggle(selectedRoleCode!, p.permissionCode)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
