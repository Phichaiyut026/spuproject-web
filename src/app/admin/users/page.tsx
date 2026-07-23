"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, Badge, Table } from "@/components/ui";
import { api } from "@/lib/api";
import { UserInfo } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = { R001: "Admin", R002: "Supervisor", R003: "Staff" };
const ROLE_TONE: Record<string, "primary" | "info" | "secondary"> = { R001: "primary", R002: "info", R003: "secondary" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    api.get<UserInfo[]>("/api/admin/users").then(setUsers);
  }, []);

  return (
    <AppShell>
      <PageHeader title="จัดการระบบ" subtitle="จัดการสิทธิ์และสถานะผู้ใช้งานในระบบ" />

      <Table>
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--text-muted)] border-b" style={{ borderColor: "var(--line)" }}>
            <th className="px-4 py-3">รหัสผู้ใช้</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">ชื่อ-นามสกุล</th>
            <th className="px-4 py-3">อีเมล</th>
            <th className="px-4 py-3">บทบาท</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId} className="border-b last:border-0 hover:bg-[var(--hover-tint)]" style={{ borderColor: "var(--line)" }}>
              <td className="px-4 py-3">{u.userId}</td>
              <td className="px-4 py-3">{u.username}</td>
              <td className="px-4 py-3">{u.realName}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <Badge tone={ROLE_TONE[u.roleCode] ?? "secondary"}>{ROLE_LABEL[u.roleCode] ?? u.roleCode}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={u.status === "Active" ? "success" : "secondary"}>{u.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <a href={`/admin/users/${u.userId}/edit`} className="text-sm font-medium text-[var(--ink)] hover:underline">
                  แก้ไข
                </a>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-[var(--text-muted)] py-8">
                ยังไม่มีผู้ใช้งานในระบบ
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </AppShell>
  );
}
