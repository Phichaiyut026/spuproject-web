"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  MapPin,
  Settings2,
  ScrollText,
  Search,
  Download,
  RefreshCw,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { Badge } from "@/components/ui";
import OrgTree, { OrgNode } from "@/components/admin/OrgTree";
import UserAddForm from "@/components/admin/UserAddForm";
import { api } from "@/lib/api";
import { UserInfo } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = { R001: "Admin", R002: "Supervisor", R003: "Staff" };
const ROLE_TONE: Record<string, "primary" | "info" | "secondary"> = {
  R001: "primary",
  R002: "info",
  R003: "secondary",
};

const CONSOLE_SECTIONS = [
  { id: "users", label: "จัดการผู้ใช้งาน", icon: Users },
  { id: "orgs", label: "หน่วยงาน / องค์กร", icon: Building2 },
  { id: "areas", label: "จัดการพื้นที่", icon: MapPin },
  { id: "settings", label: "ตั้งค่าระบบ", icon: Settings2 },
  { id: "logs", label: "บันทึกการใช้งาน", icon: ScrollText },
];

const COMPANY_NAME = "ThaiMing Lighting";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("users");
  const [tab, setTab] = useState<"list" | "add">("list");
  const [selectedOrg, setSelectedOrg] = useState("all");

  const [nameQuery, setNameQuery] = useState("");
  const [loginQuery, setLoginQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // committed filters (applied on Search)
  const [applied, setApplied] = useState({ name: "", login: "", role: "", status: "" });

  function loadUsers() {
    setLoading(true);
    api
      .get<UserInfo[]>("/api/admin/users")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }

  useEffect(loadUsers, []);

  const tree: OrgNode[] = useMemo(() => {
    const byRole = (code: string) => users.filter((u) => u.roleCode === code).length;
    return [
      {
        id: "all",
        label: COMPANY_NAME,
        count: users.length,
        children: [
          { id: "R001", label: "ผู้ดูแลระบบ (Admin)", count: byRole("R001") },
          { id: "R002", label: "หัวหน้างาน (Supervisor)", count: byRole("R002") },
          { id: "R003", label: "พนักงาน (Staff)", count: byRole("R003") },
        ],
      },
    ];
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (selectedOrg !== "all" && u.roleCode !== selectedOrg) return false;
      if (applied.role && u.roleCode !== applied.role) return false;
      if (applied.status && u.status !== applied.status) return false;
      if (applied.name && !u.realName?.toLowerCase().includes(applied.name.toLowerCase())) return false;
      if (applied.login && !u.username?.toLowerCase().includes(applied.login.toLowerCase())) return false;
      return true;
    });
  }, [users, selectedOrg, applied]);

  function applySearch() {
    setApplied({ name: nameQuery, login: loginQuery, role: roleFilter, status: statusFilter });
  }

  function resetSearch() {
    setNameQuery("");
    setLoginQuery("");
    setRoleFilter("");
    setStatusFilter("");
    setApplied({ name: "", login: "", role: "", status: "" });
  }

  function exportCsv() {
    const header = ["Company", "LoginName", "Name", "Email", "Role", "Status"];
    const rows = filtered.map((u) => [
      COMPANY_NAME,
      u.username,
      u.realName,
      u.email ?? "",
      ROLE_LABEL[u.roleCode] ?? u.roleCode,
      u.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(u: UserInfo) {
    if (!confirm(`ต้องการลบผู้ใช้ "${u.realName}" ใช่หรือไม่?`)) return;
    try {
      await api.delete(`/api/admin/users/${u.userId}`);
      setUsers((prev) => prev.filter((x) => x.userId !== u.userId));
    } catch {
      alert("ไม่สามารถลบผู้ใช้งานได้");
    }
  }

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={22} className="text-[var(--brand-strong)]" />
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)]">บริหารจัดการระบบ</h3>
          <p className="text-sm text-[var(--text-muted)]">จัดการผู้ใช้งาน หน่วยงาน และการตั้งค่าระบบ</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Console section rail */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border bg-white p-2 shadow-sm" style={{ borderColor: "var(--line)" }}>
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              องค์กร &amp; ผู้ใช้งาน
            </p>
            {CONSOLE_SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[var(--brand-tint)] font-semibold text-[var(--brand-strong)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--hover-tint)]"
                  }`}
                >
                  <Icon size={17} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Org tree */}
        <div
          className="w-full shrink-0 rounded-xl border bg-white shadow-sm lg:w-64"
          style={{ borderColor: "var(--line)" }}
        >
          <OrgTree tree={tree} selectedId={selectedOrg} onSelect={setSelectedOrg} onRefresh={loadUsers} />
        </div>

        {/* Main panel */}
        <section className="min-w-0 flex-1 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--line)" }}>
          {section !== "users" ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
              <Settings2 size={34} className="text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">
                ส่วน &quot;{CONSOLE_SECTIONS.find((s) => s.id === section)?.label}&quot; อยู่ระหว่างการพัฒนา
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-1 border-b px-3 pt-2" style={{ borderColor: "var(--line)" }}>
                {(
                  [
                    { id: "list", label: "รายชื่อผู้ใช้งาน" },
                    { id: "add", label: "เพิ่มผู้ใช้งาน" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tab === t.id
                        ? "border-[var(--brand)] text-[var(--brand-strong)]"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "add" ? (
                <UserAddForm
                  onCreated={() => {
                    loadUsers();
                    setTab("list");
                  }}
                  onCancel={() => setTab("list")}
                />
              ) : (
                <>
                  {/* Filter bar */}
                  <div className="border-b p-4" style={{ borderColor: "var(--line)" }}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-20 shrink-0 text-[var(--ink-soft)]">LoginName</span>
                        <input
                          value={loginQuery}
                          onChange={(e) => setLoginQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applySearch()}
                          className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                          style={{ borderColor: "var(--line-strong)" }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-20 shrink-0 text-[var(--ink-soft)]">ชื่อ</span>
                        <input
                          value={nameQuery}
                          onChange={(e) => setNameQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applySearch()}
                          className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                          style={{ borderColor: "var(--line-strong)" }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-20 shrink-0 text-[var(--ink-soft)]">บทบาท</span>
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                          style={{ borderColor: "var(--line-strong)" }}
                        >
                          <option value="">ทั้งหมด</option>
                          <option value="R001">Admin</option>
                          <option value="R002">Supervisor</option>
                          <option value="R003">Staff</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="w-20 shrink-0 text-[var(--ink-soft)]">สถานะ</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                          style={{ borderColor: "var(--line-strong)" }}
                        >
                          <option value="">ทั้งหมด</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={applySearch}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-[var(--brand-contrast)] transition-colors hover:bg-[var(--brand-strong)]"
                      >
                        <Search size={15} /> ค้นหา
                      </button>
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--hover-tint)]"
                        style={{ borderColor: "var(--line-strong)" }}
                      >
                        ล้างค่า
                      </button>
                      <div className="ml-auto flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTab("add")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-[var(--brand-contrast)] transition-colors hover:bg-[var(--brand-strong)]"
                        >
                          <UserPlus size={15} /> เพิ่มผู้ใช้งาน
                        </button>
                        <button
                          type="button"
                          onClick={exportCsv}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--hover-tint)]"
                          style={{ borderColor: "var(--line-strong)" }}
                        >
                          <Download size={15} /> Export
                        </button>
                        <button
                          type="button"
                          onClick={loadUsers}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--hover-tint)]"
                          style={{ borderColor: "var(--line-strong)" }}
                        >
                          <RefreshCw size={15} /> รีเฟรช
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="border-b bg-[var(--hover-tint)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                          style={{ borderColor: "var(--line)" }}
                        >
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">LoginName</th>
                          <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-3">อีเมล</th>
                          <th className="px-4 py-3">บทบาท</th>
                          <th className="px-4 py-3">สถานะ</th>
                          <th className="px-4 py-3 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                              กำลังโหลดข้อมูล...
                            </td>
                          </tr>
                        )}
                        {!loading &&
                          filtered.map((u) => (
                            <tr
                              key={u.userId}
                              className="border-b last:border-0 hover:bg-[var(--hover-tint)]"
                              style={{ borderColor: "var(--line)" }}
                            >
                              <td className="px-4 py-3 text-[var(--text-muted)]">{COMPANY_NAME}</td>
                              <td className="px-4 py-3 font-medium text-[var(--brand-strong)]">{u.username}</td>
                              <td className="px-4 py-3">{u.realName}</td>
                              <td className="px-4 py-3 text-[var(--ink-soft)]">{u.email ?? "-"}</td>
                              <td className="px-4 py-3">
                                <Badge tone={ROLE_TONE[u.roleCode] ?? "secondary"}>
                                  {ROLE_LABEL[u.roleCode] ?? u.roleCode}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge tone={u.status === "Active" ? "success" : "secondary"}>{u.status}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={`/admin/users/${u.userId}/edit`}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--info)] hover:bg-[var(--info-tint)]"
                                  >
                                    <Pencil size={13} /> แก้ไข
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(u)}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-tint)]"
                                  >
                                    <Trash2 size={13} /> ลบ
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {!loading && filtered.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                              ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {!loading && (
                    <div
                      className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-[var(--text-muted)]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <span>
                        แสดง {filtered.length} จากทั้งหมด {users.length} รายการ
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
