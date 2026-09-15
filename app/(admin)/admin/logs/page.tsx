import { adminDb } from "@/lib/firebase-admin";
import type { AppUser, EventLog } from "@/lib/types";

export default async function AdminLogsPage() {
  const [usersSnap, logsSnap] = await Promise.all([adminDb.collection("users").get(), adminDb.collection("eventLogs").orderBy("timestamp", "desc").limit(100).get()]);
  const userMap = new Map(usersSnap.docs.map((d) => [d.id, d.data() as AppUser]));
  const logs = logsSnap.docs.map((d) => d.data() as EventLog);
  return <div className="max-w-3xl"><h1 className="mb-6 text-2xl font-semibold text-gray-900">Event Log</h1><div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="border-b border-gray-100 text-left text-gray-500"><tr><th className="p-3">เวลา</th><th className="p-3">ผู้ใช้</th><th className="p-3">เหตุการณ์</th><th className="p-3">รายละเอียด</th><th className="p-3">IP</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b border-gray-50"><td className="p-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString("th-TH")}</td><td className="p-3">{userMap.get(log.userId)?.nameTH ?? log.userId}</td><td className="p-3">{log.event}</td><td className="p-3 text-gray-500">{log.detail}</td><td className="p-3 text-gray-400">{log.ip}</td></tr>)}</tbody></table>{logs.length === 0 && <p className="p-6 text-gray-500">ยังไม่มีบันทึกเหตุการณ์</p>}</div></div>;
}
