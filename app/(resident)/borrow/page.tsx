"use client";

import { useState } from "react";
import FaceScan from "@/components/FaceScan";
import BorrowForm from "@/components/BorrowForm";

export default function BorrowPage() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">ยืมอุปกรณ์</h1>

      {!verified ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="mb-4 text-sm text-gray-600">
            กรุณาสแกนใบหน้าเพื่อยืนยันตัวตนก่อนทำรายการยืม
          </p>
          <FaceScan onSuccess={() => setVerified(true)} />
        </div>
      ) : (
        <BorrowForm faceVerified={verified} />
      )}
    </div>
  );
}
