"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ApiError } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
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
        <h1 className="text-3xl font-bold mb-3">Office Automation System</h1>
        <p className="text-gray-300 max-w-md leading-relaxed">
          ระบบจัดการกระบวนการทำงานสำนักงาน บริษัท ไทย หมิง ไลท์ติ้ง จำกัด — ตรวจสอบชิ้นงาน อนุมัติงาน
          รายงานประจำสัปดาห์ และข้อมูลไฟฟ้าจากมิเตอร์อัจฉริยะ ในที่เดียว
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-[380px] bg-white border rounded-xl shadow-sm px-8 py-9"
          style={{ borderColor: "var(--line)" }}
        >
          <h2 className="text-2xl font-bold mb-1">เข้าสู่ระบบ</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งาน</p>

          {error && (
            <div className="border rounded-md px-3 py-2 mb-4 text-sm bg-[#fdeaea] border-[#f6d4d4] text-[#a02121]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">Username</label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[var(--ink)] text-white py-2 text-sm font-medium hover:bg-black disabled:opacity-60"
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-semibold text-[var(--ink)]">
              สมัครสมาชิก
            </Link>
          </p>
          <p className="text-center mt-2 text-xs text-[var(--text-muted)]">ทดสอบด้วย admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
