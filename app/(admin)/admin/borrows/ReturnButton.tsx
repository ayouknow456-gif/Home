"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReturnButton({ borrowId }: { borrowId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleReturn() {
    setLoading(true);
    try { const res = await fetch(`/api/borrows/${borrowId}`, { method: "PATCH" }); if (!res.ok) throw new Error(); toast.success("บันทึกการคืนแล้ว"); router.refresh(); }
    catch { toast.error("เกิดข้อผิดพลาด"); } finally { setLoading(false); }
  }
  return <button onClick={handleReturn} disabled={loading} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">{loading ? "..." : "บันทึกคืน"}</button>;
}
