import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";
import { sendLineMessage, LINE_EVENTS } from "@/lib/line";
import type { AppUser, Repair } from "@/lib/types";

const STATUS_LABEL: Record<Repair["status"], string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  done: "เสร็จสิ้น",
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  if (!["pending", "in_progress", "done"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const ref = adminDb.collection("repairs").doc(params.id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  await ref.update({ status, updatedAt: new Date().toISOString() });

  const repair = doc.data() as Repair;
  const userDoc = await adminDb.collection("users").doc(repair.userId).get();
  const user = userDoc.data() as AppUser | undefined;
  if (user?.lineId) {
    await sendLineMessage(user.lineId, LINE_EVENTS.REPAIR_STATUS(STATUS_LABEL[status as Repair["status"]]));
  }

  return NextResponse.json({ ok: true });
}
