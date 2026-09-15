import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <div className="flex"><Sidebar role="admin" /><main className="min-h-screen flex-1 bg-gray-50 p-8">{children}</main></div>;
}
