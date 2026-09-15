import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createSessionCookie, checkRateLimit } from "@/lib/auth";
import { euclideanDistance } from "@/lib/face-match";
import { notifyAdmin, LINE_EVENTS } from "@/lib/line";
import type { AppUser } from "@/lib/types";

const MATCH_THRESHOLD = 0.5;
const MAX_FAIL_STREAK = 3;

type FaceMatch = { user: AppUser; distance: number };

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "ลองบ่อยเกินไป กรุณารอสักครู่" }, { status: 429 });
  const { descriptor } = await req.json();
  if (!Array.isArray(descriptor) || descriptor.length !== 128) return NextResponse.json({ error: "invalid descriptor" }, { status: 400 });
  const liveDescriptor = new Float32Array(descriptor);
  const snapshot = await adminDb.collection("users").where("status", "==", "active").get();

  let bestMatch: FaceMatch | null = null;
  for (const doc of snapshot.docs) {
    const user = doc.data() as AppUser;
    if (!user.faceDescriptor || user.faceDescriptor.length !== 128) continue;
    const distance = euclideanDistance(liveDescriptor, user.faceDescriptor);
    if (bestMatch === null || distance < bestMatch.distance) {
      bestMatch = { user, distance };
    }
  }

  if (bestMatch === null || bestMatch.distance > MATCH_THRESHOLD) {
    const failRef = adminDb.collection("faceLoginFailures").doc(ip.replace(/[.:]/g, "_"));
    const failDoc = await failRef.get();
    const count = (failDoc.data()?.count ?? 0) + 1;
    await failRef.set({ count, lastAttempt: new Date().toISOString() });
    if (count >= MAX_FAIL_STREAK) await notifyAdmin(LINE_EVENTS.FACE_SCAN_FAIL(count, "ไม่ทราบห้อง"));
    return NextResponse.json({ error: "no match" }, { status: 401 });
  }

  const matchedUser = bestMatch.user;
  await createSessionCookie({ uid: matchedUser.uid, role: matchedUser.role, username: matchedUser.username });
  await adminDb.collection("eventLogs").add({ userId: matchedUser.uid, event: "login", detail: "face_scan", timestamp: new Date().toISOString(), ip });
  await notifyAdmin(LINE_EVENTS.MEMBER_LOGIN(matchedUser.nameTH, "หน้า"));
  return NextResponse.json({ role: matchedUser.role });
}
