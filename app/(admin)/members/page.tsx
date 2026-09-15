import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import MemberCard from "@/components/MemberCard";
import type { AppUser } from "@/lib/types";

export default async function AdminMembersPage() {
  const snapshot = await adminDb.collection("users").where("role", "==", "resident").orderBy("roomNumber").get();
  const members = snapshot.docs.map((d) => d.data() as AppUser);
  return <div><div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-semibold text-gray-900">สมาชิก ({members.length})</h1><Link href="/admin/members/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">+ เพิ่มสมาชิก</Link></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{members.map((m) => <MemberCard key={m.uid} member={m} />)}{members.length === 0 && <p className="text-gray-500">ยังไม่มีสมาชิกในระบบ</p>}</div></div>;
}
