"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Resident {
  uid: string;
  label: string;
}

export default function NewBillForm({ residents }: { residents: Resident[] }) {
  const router = useRouter();
  const now = new Date();
  const [userId, setUserId] = useState(residents[0]?.uid ?? "");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [units, setUnits] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || units <= 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, month, year, units }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("ออกบิลเรียบร้อย");
      setUnits(0);
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-5">
      <select value={userId} onChange={(e) => setUserId(e.target.value)} className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2">
        {residents.map((r) => <option key={r.uid} value={r.uid}>{r.label}</option>)}
      </select>
      <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="เดือน" />
      <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="ปี ค.ศ." />
      <input type="number" value={units} onChange={(e) => setUnits(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="หน่วยไฟ" />
      <button type="submit" disabled={submitting} className="col-span-2 rounded-lg bg-brand py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50 sm:col-span-5">{submitting ? "กำลังออกบิล..." : "ออกบิล"}</button>
    </form>
  );
}
