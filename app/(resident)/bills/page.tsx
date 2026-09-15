import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import BillCard from "@/components/BillCard";
import type { Bill } from "@/lib/types";

export default async function ResidentBillsPage() {
  const session = await getSession();
  const snapshot = await adminDb
    .collection("bills")
    .where("userId", "==", session!.uid)
    .orderBy("year", "desc")
    .orderBy("month", "desc")
    .get();

  const bills = snapshot.docs.map((d) => d.data() as Bill);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">บิลไฟฟ้าของฉัน</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {bills.map((b) => (
          <BillCard key={b.id} bill={b} />
        ))}
        {bills.length === 0 && <p className="text-gray-500">ยังไม่มีบิล</p>}
      </div>
    </div>
  );
}
