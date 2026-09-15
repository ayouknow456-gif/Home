"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavItem { label: string; href: string; icon: string; }

const ADMIN_NAV: NavItem[] = [
  { label: "แดชบอร์ด", href: "/admin/dashboard", icon: "📊" },
  { label: "สมาชิก", href: "/admin/members", icon: "👥" },
  { label: "บิลไฟ", href: "/admin/bills", icon: "⚡" },
  { label: "ยืม-คืน", href: "/admin/borrows", icon: "📦" },
  { label: "แจ้งซ่อม", href: "/admin/repairs", icon: "🔧" },
  { label: "Log", href: "/admin/logs", icon: "🗒️" },
];

const RESIDENT_NAV: NavItem[] = [
  { label: "ข้อมูลส่วนตัว", href: "/profile", icon: "🪪" },
  { label: "ยืมอุปกรณ์", href: "/borrow", icon: "📦" },
  { label: "แจ้งซ่อม", href: "/repair", icon: "🔧" },
  { label: "บิลไฟฟ้า", href: "/bills", icon: "⚡" },
  { label: "ค่าใช้จ่าย", href: "/expenses", icon: "💰" },
];

export default function Sidebar({ role }: { role: "admin" | "resident" }) {
  const pathname = usePathname();
  const items = role === "admin" ? ADMIN_NAV : RESIDENT_NAV;
  return (
    <aside className="flex h-screen w-60 flex-col bg-brand font-sarabun text-white">
      <div className="px-6 py-6 text-lg font-semibold">🏠 ระบบจัดการที่พักอาศัย</div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={clsx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-accent text-brand-dark font-semibold" : "text-white/85 hover:bg-brand-light")}><span>{item.icon}</span><span>{item.label}</span></Link>;
        })}
      </nav>
      <form action="/api/auth/logout" method="post" className="px-3 pb-6"><button className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-brand-light">🚪 ออกจากระบบ</button></form>
    </aside>
  );
}
