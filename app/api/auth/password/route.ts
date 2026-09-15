import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyPassword, createSessionCookie, checkRateLimit } from "@/lib/auth";
import { notifyAdmin, LINE_EVENTS } from "@/lib/line";
import type { AppUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "ลองบ่อยเกินไป กรุณารอสักครู่" }, { status: 429 });
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "missing credentials" }, { status: 400 });
  const snapshot = await adminDb.collection("users").where("username", "==", username).limit(1).get();
  if (snapshot.empty) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  const doc = snapshot.docs[0];
  const user = doc.data() as AppUser;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  await createSessionCookie({ uid: user.uid, role: user.role, username: user.username });
  await adminDb.collection("eventLogs").add({ userId: user.uid, event: "login", detail: "password", timestamp: new Date().toISOString(), ip });
  await notifyAdmin(LINE_EVENTS.MEMBER_LOGIN(user.nameTH, "รหัส"));
  return NextResponse.json({ role: user.role });
}
