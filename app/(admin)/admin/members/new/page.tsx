"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", nameTH: "", nameEN: "", phone: "", lineId: "", roomNumber: "", monthlyRent: "", idNumber: "", passportNumber: "", houseRegNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  function update(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try { const res = await fetch("/api/admin/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: form.username, password: form.password, nameTH: form.nameTH, nameEN: form.nameEN, phone: form.phone, lineId: form.lineId, roomNumber: form.roomNumber, monthlyRent: Number(form.monthlyRent) || 0, idCard: { number: form.idNumber, issueDate: "", expireDate: "", imageUrl: "" }, passport: { number: form.passportNumber, country: "", expireDate: "", imageUrl: "" }, houseRegistration: { number: form.houseRegNumber, address: "", imageUrl: "" } }) }); if (!res.ok) throw new Error(await res.text()); const { uid } = await res.json(); toast.success("เพิ่มสมาชิกเรียบร้อย — ต่อไปให้สมาชิกลงทะเบียนสแกนหน้าที่หน้า Login"); router.push(`/admin/members/${uid}`); } catch { toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่"); } finally { setSubmitting(false); }
  }
  const fields: { key: keyof typeof form; label: string; type?: string }[] = [{ key: "nameTH", label: "ชื่อ-นามสกุล (ไทย)" }, { key: "nameEN", label: "ชื่อ-นามสกุล (อังกฤษ)" }, { key: "roomNumber", label: "หมายเลขห้อง" }, { key: "phone", label: "เบอร์โทร" }, { key: "lineId", label: "LINE User ID" }, { key: "monthlyRent", label: "ค่าเช่าต่อเดือน (บาท)", type: "number" }, { key: "username", label: "ชื่อผู้ใช้งาน (สำหรับ login สำรอง)" }, { key: "password", label: "รหัสผ่านเริ่มต้น", type: "password" }, { key: "idNumber", label: "เลขบัตรประชาชน" }, { key: "passportNumber", label: "เลขพาสปอร์ต (ถ้ามี)" }, { key: "houseRegNumber", label: "เลขทะเบียนบ้าน" }];
  return <div className="max-w-xl"><h1 className="mb-6 text-2xl font-semibold text-gray-900">เพิ่มสมาชิกใหม่</h1><form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">{fields.map((f) => <div key={f.key}><label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label><input type={f.type ?? "text"} value={form[f.key]} onChange={(e) => update(f.key, e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" /></div>)}<p className="text-xs text-gray-500">หลังบันทึก ให้สมาชิกไปที่หน้า Login เพื่อลงทะเบียนใบหน้าในการเข้าใช้งานครั้งแรก</p><button type="submit" disabled={submitting} className="w-full rounded-lg bg-brand py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50">{submitting ? "กำลังบันทึก..." : "บันทึกสมาชิก"}</button></form></div>;
}
