"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FaceScan from "@/components/FaceScan";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "face" | "password">("choose");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleFaceSuccess(descriptor: Float32Array) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });
      if (!res.ok) {
        toast.error("ไม่พบใบหน้านี้ในระบบ");
        setMode("choose");
        return;
      }
      const { role } = await res.json();
      router.push(role === "admin" ? "/admin/dashboard" : "/profile");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      const { role } = await res.json();
      router.push(role === "admin" ? "/admin/dashboard" : "/profile");
    } finally {
      setSubmitting(false);
    }
  }

  const lineOaUrl = process.env.NEXT_PUBLIC_LINE_OA_URL ?? "#";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand to-brand-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="text-4xl">🏠</div>
          <h1 className="mt-2 text-xl font-semibold text-brand">ระบบจัดการที่พักอาศัย</h1>
        </div>

        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("face")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-medium text-white transition hover:bg-brand-dark"
            >
              📷 สแกนใบหน้า
            </button>
            <button
              onClick={() => setMode("password")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand py-3 font-medium text-brand transition hover:bg-brand/5"
            >
              🔑 ใช้รหัสผ่านแทน
            </button>
          </div>
        )}

        {mode === "face" && (
          <div className="flex flex-col items-center gap-4">
            <FaceScan onSuccess={handleFaceSuccess} onFail={() => toast.error("หมดเวลา กรุณาลองใหม่")} />
            <button onClick={() => setMode("choose")} className="text-sm text-gray-500 underline">
              ย้อนกลับ
            </button>
          </div>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้งาน"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand py-2 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
            <button type="button" onClick={() => setMode("choose")} className="w-full text-sm text-gray-500 underline">
              ย้อนกลับ
            </button>
          </form>
        )}

        <div className="mt-8 space-y-2 border-t border-gray-100 pt-6 text-center text-sm">
          <a href={lineOaUrl} className="block text-brand underline">
            ขอสมัครสมาชิก
          </a>
          <a href={lineOaUrl} className="block text-gray-500 underline">
            ติดต่อเรา
          </a>
        </div>
      </div>
    </main>
  );
}
