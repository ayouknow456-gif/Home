// Server-only. Sends push notifications via LINE Messaging API.
const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export const LINE_EVENTS = {
  MEMBER_REGISTER: (name: string) => `📝 มีคนขอสมัครสมาชิกใหม่: ${name}`,
  MEMBER_LOGIN: (name: string, method: "หน้า" | "รหัส") => `🔐 ${name} เข้าสู่ระบบ (${method})`,
  FACE_SCAN_FAIL: (count: number, room: string) => `⚠️ สแกนหน้าไม่ผ่าน ${count} ครั้ง - ห้อง ${room}`,
  BORROW_REQUEST: (name: string, item: string, dueDate: string) => `📦 ${name} ขอยืม ${item} — กำหนดคืน ${dueDate}`,
  BORROW_RETURN: (name: string, item: string) => `✅ ${name} คืน ${item} แล้ว`,
  REPAIR_REQUEST: (name: string, type: string, room: string) => `🔧 ${name} แจ้งซ่อม ${type} — ห้อง ${room}`,
  REPAIR_STATUS: (status: string) => `🔄 อัพเดตงานซ่อม: ${status}`,
  BILL_UPDATED: (month: string, amount: number) => `⚡ บิลไฟเดือน ${month} พร้อมแล้ว — ยอด ${amount.toLocaleString()} บาท`,
  CONTRACT_EXPIRING: (name: string) => `📅 สัญญาของ ${name} ใกล้หมด (อีก 30 วัน)`,
  BIRTHDAY_TODAY: (name: string) => `🎂 วันนี้วันเกิดของ ${name}!`,
};

export async function sendLineMessage(toUserId: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) { console.warn("LINE_CHANNEL_ACCESS_TOKEN not set — skipping LINE notification"); return; }
  const res = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: toUserId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) { const body = await res.text(); console.error("LINE push failed:", res.status, body); }
}

export async function notifyAdmin(text: string) {
  const adminLineId = process.env.ADMIN_LINE_USER_ID;
  if (!adminLineId) return;
  await sendLineMessage(adminLineId, text);
}
