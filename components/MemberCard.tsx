import Link from "next/link";
import clsx from "clsx";
import type { AppUser } from "@/lib/types";

const STATUS_LABEL: Record<AppUser["status"], string> = {
  active: "อาศัยอยู่",
  moved_out: "ย้ายออก",
  temporary: "พักชั่วคราว",
};

const STATUS_STYLE: Record<AppUser["status"], string> = {
  active: "bg-green-100 text-green-700",
  moved_out: "bg-gray-200 text-gray-600",
  temporary: "bg-amber-100 text-amber-700",
};

export default function MemberCard({ member }: { member: AppUser }) {
  return (
    <Link
      href={`/admin/members/${member.uid}`}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold">
          {member.roomNumber || "—"}
        </div>
        <div>
          <p className="font-medium text-gray-900">{member.nameTH}</p>
          <p className="text-sm text-gray-500">{member.nameEN}</p>
        </div>
      </div>
      <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[member.status])}>
        {STATUS_LABEL[member.status]}
      </span>
    </Link>
  );
}
