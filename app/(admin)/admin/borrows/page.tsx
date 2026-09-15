import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, Borrow } from "@/lib/types";
import ReturnButton from "./ReturnButton";

export default async function AdminBorrowsPage() {
  const [usersSnap, borrowsSnap] = await Promise.all([adminDb.collection("users").get(), adminDb.collection("borrows").orderBy("borrowDate", "desc").limit(50).get()]);
  const userMap = new Map(usersSnap.docs.map((d) => [d.id, d.data() as AppUser]));
  const borrows = borrowsSnap.docs.map((d) => d.data() as Borrow);
  return <div className="max-w-3xl"><h1 className="mb-6 text-2xl font-semibold text-gray-900">รายการยืม-คืนอุปกรณ์</h1><div className="space-y-3">{borrows.map((b) => { const user = userMap.get(b.userId); const overdue = b.status === "borrowed" && new Date(b.dueDate) < new Date(); return <div key={b.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"><div><p className="font-medium text-gray-900">{b.item} x{b.quantity} — {user?.nameTH ?? "—"} (ห้อง {user?.roomNumber ?? "—"})</p><p className="text-sm text-gray-500">ยืม {new Date(b.borrowDate).toLocaleDateString("th-TH")} · กำหนดคืน {new Date(b.dueDate).toLocaleDateString("th-TH")}{overdue && <span className="ml-2 text-red-600">เกินกำหนด</span>}</p></div>{b.status === "borrowed" ? <ReturnButton borrowId={b.id} /> : <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">คืนแล้ว</span>}</div>; })}{borrows.length === 0 && <p className="text-gray-500">ยังไม่มีรายการยืม</p>}</div></div>;
}
