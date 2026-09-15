"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface BorrowFormProps {
  faceVerified: boolean;
  onSubmitted?: () => void;
}

export default function BorrowForm({ faceVerified, onSubmitted }: BorrowFormProps) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!faceVerified) {
      toast.error("กรุณาสแกนใบหน้าเพื่อยืนยันตัวตนก่อน");
      return;
    }
    if (!item || !dueDate) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, quantity, dueDate, faceVerified }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("ส่งคำขอยืมเรียบร้อย");
      setItem("");
      setQuantity(1);
      setDueDate("");
      onSubmitted?.();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ชื่ออุปกรณ์</label>
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="เช่น สว่านไฟฟ้า"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">จำนวน</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">วันกำหนดคืน</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand py-2 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "กำลังส่ง..." : "ยืนยันการยืม"}
      </button>
    </form>
  );
}
