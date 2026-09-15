"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Repair } from "@/lib/types";

const TYPES: Repair["type"][] = ["ไฟฟ้า", "แอร์", "ประปา", "เฟอร์นิเจอร์", "อื่นๆ"];

export default function RepairForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [type, setType] = useState<Repair["type"]>("ไฟฟ้า");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("กรุณาอธิบายอาการ");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await fetch("/api/repairs", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      toast.success("แจ้งซ่อมเรียบร้อย");
      setDescription("");
      setImage(null);
      onSubmitted?.();
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ประเภท</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Repair["type"])}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">อธิบายอาการ</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="อธิบายปัญหาที่พบ..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">แนบภาพ (ถ้ามี)</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full text-sm" />
      </div>
      <button type="submit" disabled={submitting} className="w-full rounded-lg bg-brand py-2 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50">
        {submitting ? "กำลังส่ง..." : "ส่งเรื่องแจ้งซ่อม"}
      </button>
    </form>
  );
}
