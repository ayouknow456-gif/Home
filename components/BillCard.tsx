import clsx from "clsx";
import type { Bill } from "@/lib/types";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function BillCard({ bill }: { bill: Bill }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900">
          {THAI_MONTHS[bill.month - 1]} {bill.year + 543}
        </p>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            bill.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {bill.status === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-brand">{bill.amount.toLocaleString()}</span>
        <span className="text-sm text-gray-500">บาท ({bill.units} หน่วย)</span>
      </div>
    </div>
  );
}
