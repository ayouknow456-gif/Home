import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, Bill } from "@/lib/types";

async function getStats() {
  const [usersSnap, billsSnap, repairsSnap, borrowsSnap] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("bills").where("status", "==", "unpaid").get(),
    adminDb.collection("repairs").where("status", "!=", "done").get(),
    adminDb.collection("borrows").where("status", "==", "borrowed").get(),
  ]);
  const users = usersSnap.docs.map((d) => d.data() as AppUser);
  const activeResidents = users.filter((u) => u.status === "active" && u.role === "resident");
  return { totalResidents: activeResidents.length, unpaidBills: billsSnap.size, unpaidAmount: billsSnap.docs.reduce((sum, d) => sum + ((d.data() as Bill).amount ?? 0), 0), pendingRepairs: repairsSnap.size, activeBorrows: borrowsSnap.size };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const cards = [
    { label: "ผู้เช่าที่พักอาศัยอยู่", value: stats.totalResidents, icon: "👥" },
    { label: "บิลค้างชำระ", value: `${stats.unpaidBills} บิล (${stats.unpaidAmount.toLocaleString()} บาท)`, icon: "⚡" },
    { label: "งานซ่อมค้าง", value: stats.pendingRepairs, icon: "🔧" },
    { label: "อุปกรณ์ที่ถูกยืมอยู่", value: stats.activeBorrows, icon: "📦" },
  ];
  return <div><h1 className="mb-6 text-2xl font-semibold text-gray-900">แดชบอร์ด</h1><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((c) => <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="text-2xl">{c.icon}</div><p className="mt-2 text-2xl font-semibold text-brand">{c.value}</p><p className="text-sm text-gray-500">{c.label}</p></div>)}</div></div>;
}
