"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", realName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/register", form);
      router.replace("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "var(--surface-bg)" }}>
      <div
        className="hidden md:flex flex-1 flex-col justify-center px-16 text-white"
        style={{ background: "var(--ink)" }}
      >
        <div className="text-4xl text-gray-400 mb-5">🏢</div>
        <h1 className="text-3xl font-bold mb-3">สมัครใช้งานระบบ OA</h1>
        <p className="text-gray-300 max-w-md leading-relaxed">
          สร้างบัญชีผู้ใช้งานเพื่อเริ่มบันทึกและติดตามงานภายในองค์กร — บัญชีใหม่จะได้รับสิทธิ์ระดับพนักงานทั่วไปเป็นค่าเริ่มต้น
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-[420px] bg-white border rounded-xl shadow-sm px-8 py-9"
          style={{ borderColor: "var(--line)" }}
        >
          <h2 className="text-2xl font-bold mb-1">สมัครสมาชิก</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">กรอกข้อมูลให้ครบเพื่อสร้างบัญชีใหม่</p>

          {error && (
            <div className="border rounded-md px-3 py-2 mb-4 text-sm bg-[#fdeaea] border-[#f6d4d4] text-[#a02121]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">Username</label>
              <input
                required
                autoFocus
                value={form.username}
                onChange={update("username")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">ชื่อ-นามสกุล</label>
              <input
                required
                value={form.realName}
                onChange={update("realName")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">อีเมล</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={update("password")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">ยืนยัน Password</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[var(--ink)] text-white py-2 text-sm font-medium hover:bg-black disabled:opacity-60"
            >
              {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-semibold text-[var(--ink)]">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
