"use client";

import { useState } from "react";
import { Label, Input, Select, Button, Alert } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export default function UserAddForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleCode, setRoleCode] = useState("R003");
  const [status, setStatus] = useState("Active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/admin/users", { username, realName, email, password, roleCode, status });
      setDone(true);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ไม่สามารถเพิ่มผู้ใช้งานได้");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 p-5">
      {error && <Alert tone="danger">{error}</Alert>}
      {done && <Alert tone="success">เพิ่มผู้ใช้งานเรียบร้อยแล้ว</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Username / LoginName</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="เช่น somchai.j" />
        </div>
        <div>
          <Label>ชื่อ-นามสกุล</Label>
          <Input value={realName} onChange={(e) => setRealName(e.target.value)} required placeholder="เช่น สมชาย ใจดี" />
        </div>
        <div>
          <Label>อีเมล</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
        </div>
        <div>
          <Label>รหัสผ่านเริ่มต้น</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="อย่างน้อย 6 ตัวอักษร" />
        </div>
        <div>
          <Label>บทบาท</Label>
          <Select value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
            <option value="R001">Admin</option>
            <option value="R002">Supervisor</option>
            <option value="R003">Staff</option>
          </Select>
        </div>
        <div>
          <Label>สถานะ</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "กำลังบันทึก..." : "บันทึกผู้ใช้งาน"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
