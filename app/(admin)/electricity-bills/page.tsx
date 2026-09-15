import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, Bill } from "@/lib/types";
import NewBillForm from "../bills/NewBillForm";

export default async function AdminBillsPage() {
  const [usersSnap, billsSnap] = await Promise.all([
    adminDb.collection("users").where("role", "==", "resident").where("status", "==", "active").orderBy("roomNumber").get(),
    adminDb.collection("bills").orderBy("year", "desc").orderBy("month", "desc").limit(30).get(),
  ]);
  const users = usersSnap.docs.map((d) => d.data() as AppUser);
  const bills = billsSnap.docs.map((d) => d.data() as Bill);
  const userMap = new Map(users.map((u) => [u.uid, u]));
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">บิลไฟฟ้า</h1>
      <NewBillForm residents={users.map((u) => ({ uid: u.uid, label: `${u.roomNumber} — ${u.nameTH}` }))} />
      <section className="rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-gray-500"><tr><th className="p-3">ห้อง</th><th className="p-3">ชื่อ</th><th className="p-3">เดือน/ปี</th><th className="p-3">หน่วย</th><th className="p-3">ยอด</th><th className="p-3">สถานะ</th></tr></thead>
          <tbody>{bills.map((b) => { const user = userMap.get(b.userId); return <tr key={b.id} className="border-b border-gray-50"><td className="p-3">{user?.roomNumber ?? "—"}</td><td className="p-3">{user?.nameTH ?? "—"}</td><td className="p-3">{b.month}/{b.year + 543}</td><td className="p-3">{b.units}</td><td className="p-3">{b.amount.toLocaleString()}</td><td className="p-3">{b.status === "paid" ? "✅ ชำระแล้ว" : "⏳ ยังไม่ชำระ"}</td></tr>; })}</tbody>
        </table>
      </section>
    </div>
  );
}
