import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, Bill } from "@/lib/types";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default async function ExpensesPage() {
  const session = await getSession();
  const [userDoc, billsSnap] = await Promise.all([
    adminDb.collection("users").doc(session!.uid).get(),
    adminDb.collection("bills").where("userId", "==", session!.uid).orderBy("year", "desc").orderBy("month", "desc").limit(12).get(),
  ]);

  const user = userDoc.data() as AppUser;
  const bills = billsSnap.docs.map((d) => d.data() as Bill);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">สรุปค่าใช้จ่ายรายเดือน</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-gray-500">
            <tr>
              <th className="p-3">เดือน</th>
              <th className="p-3">ค่าเช่า</th>
              <th className="p-3">ค่าไฟ</th>
              <th className="p-3">รวม</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id} className="border-b border-gray-50">
                <td className="p-3">{THAI_MONTHS[b.month - 1]} {b.year + 543}</td>
                <td className="p-3">{user.monthlyRent?.toLocaleString() ?? "—"}</td>
                <td className="p-3">{b.amount.toLocaleString()}</td>
                <td className="p-3 font-medium text-brand">
                  {((user.monthlyRent ?? 0) + b.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && <p className="p-6 text-gray-500">ยังไม่มีข้อมูลค่าใช้จ่าย</p>}
      </div>
    </div>
  );
}
