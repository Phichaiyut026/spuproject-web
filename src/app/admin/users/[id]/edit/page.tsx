"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Label, Input, Select, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { UserInfo, SysDepartment, SysRole } from "@/lib/types";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [roleCode, setRoleCode] = useState("");
  const [status, setStatus] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [departments, setDepartments] = useState<SysDepartment[]>([]);
  const [roles, setRoles] = useState<SysRole[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<UserInfo>(`/api/admin/users/${params.id}`).then((u) => {
      setUser(u);
      setRoleCode(u.roleCode);
      setStatus(u.status);
      setDeptCode(u.deptCode ?? "");
    });
    api.get<SysDepartment[]>("/api/admin/departments").then(setDepartments);
    api.get<SysRole[]>("/api/admin/permissions/roles").then(setRoles);
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/api/admin/users/${params.id}`, { roleCode, status, deptCode: deptCode || null });
      router.push("/admin/users");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <AppShell>กำลังโหลด...</AppShell>;

  return (
    <AppShell>
      <h3 className="text-xl font-bold mb-4">แก้ไขผู้ใช้งาน</h3>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>รหัสผู้ใช้</Label>
            <Input value={user.userId} disabled />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={user.username} disabled />
          </div>
          <div>
            <Label>ชื่อ-นามสกุล</Label>
            <Input value={user.realName} disabled />
          </div>
          <div>
            <Label>บทบาท</Label>
            <Select value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
              {roles.map((r) => (
                <option key={r.roleCode} value={r.roleCode}>
                  {r.roleName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>สถานะ</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          <div>
            <Label>หน่วยงาน / แผนก</Label>
            <Select value={deptCode} onChange={(e) => setDeptCode(e.target.value)}>
              <option value="">- ไม่ระบุ -</option>
              {departments.map((d) => (
                <option key={d.deptCode} value={d.deptCode}>
                  {d.deptName}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              ✔ บันทึก
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
