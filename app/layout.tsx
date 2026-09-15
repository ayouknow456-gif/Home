import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ระบบจัดการที่พักอาศัย",
  description: "ระบบจัดการสมาชิก บิลไฟฟ้า ยืม-คืนอุปกรณ์ และแจ้งซ่อม",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="font-sarabun">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
