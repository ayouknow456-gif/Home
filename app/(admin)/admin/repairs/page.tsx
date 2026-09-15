import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, Repair } from "@/lib/types";
import StatusSelect from "./StatusSelect";

const STATUS_LABEL: Record<Repair["status"], string> = { pending: "รอดำเนินการ", in_progress: "กำลังดำเนินการ", done: "เสร็จสิ้น" };

export default async function AdminRepairsPage() {
  const [usersSnap, repairsSnap] = await Promise.all([adminDb.collection("users").get(), adminDb.collection("repairs").orderBy("createdAt", "desc").limit(50).get()]);
  const userMap = new Map(usersSnap.docs.map((d) => [d.id, d.data() as AppUser]));
  const repairs = repairsSnap.docs.map((d) => d.data() as Repair);
  return <div className="max-w-3xl"><h1 className="mb-6 text-2xl font-semibold text-gray-900">แจ้งซ่อม</h1><div className="space-y-3">{repairs.map((r) => { const user = userMap.get(r.userId); return <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-start justify-between"><div><p className="font-medium text-gray-900">{r.type} — {user?.nameTH ?? "—"} (ห้อง {user?.roomNumber ?? "—"})</p><p className="mt-1 text-sm text-gray-600">{r.description}</p><p className="mt-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("th-TH")}</p></div><StatusSelect repairId={r.id} currentStatus={r.status} /></div>{r.imageUrls.length > 0 && <div className="mt-3 flex gap-2">{r.imageUrls.map((url) => <img key={url} src={url} alt="ภาพแจ้งซ่อม" className="h-20 w-20 rounded-lg object-cover" />)}</div>}</div>; })}{repairs.length === 0 && <p className="text-gray-500">ยังไม่มีรายการแจ้งซ่อม</p>}</div></div>;
}
