"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Repair } from "@/lib/types";

export default function StatusSelect({ repairId, currentStatus }: { repairId: string; currentStatus: Repair["status"] }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  async function handleChange(next: Repair["status"]) {
    setLoading(true); setStatus(next);
    try { const res = await fetch(`/api/repairs/${repairId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }); if (!res.ok) throw new Error(); toast.success("อัพเดตสถานะแล้ว"); router.refresh(); }
    catch { toast.error("เกิดข้อผิดพลาด"); } finally { setLoading(false); }
  }
  return <select value={status} disabled={loading} onChange={(e) => handleChange(e.target.value as Repair["status"])} className="rounded-lg border border-gray-300 px-2 py-1 text-sm"><option value="pending">รอดำเนินการ</option><option value="in_progress">กำลังดำเนินการ</option><option value="done">เสร็จสิ้น</option></select>;
}
