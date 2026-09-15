import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { AppUser } from "@/lib/types";
import RevealField from "@/components/RevealField";

export default async function ProfilePage() {
  const session = await getSession();
  const doc = await adminDb.collection("users").doc(session!.uid).get();
  const user = doc.data() as AppUser;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{user.nameTH}</h1>
        <p className="text-gray-500">ห้อง {user.roomNumber}</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-gray-900">ข้อมูลติดต่อ</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">เบอร์โทร</dt>
            <dd className="font-medium">{user.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">วันเริ่มสัญญา</dt>
            <dd className="font-medium">{user.startDate || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ค่าเช่าต่อเดือน</dt>
            <dd className="font-medium">{user.monthlyRent?.toLocaleString() ?? "—"} บาท</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-medium text-gray-900">เอกสารของฉัน (แตะเพื่อดู)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RevealField label="เลขบัตรประชาชน" value={user.idCard?.number || "—"} />
          <RevealField label="เลขพาสปอร์ต" value={user.passport?.number || "—"} />
          <RevealField label="เลขทะเบียนบ้าน" value={user.houseRegistration?.number || "—"} />
        </div>
        <p className="mt-3 text-xs text-gray-400">
          หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่เพื่อแก้ไข
        </p>
      </section>
    </div>
  );
}
