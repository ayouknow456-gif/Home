import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";
import { notifyAdmin, LINE_EVENTS } from "@/lib/line";
import type { AppUser, Borrow } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ref = adminDb.collection("borrows").doc(params.id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  const borrow = doc.data() as Borrow;
  await ref.update({ status: "returned", returnDate: new Date().toISOString() });

  const userDoc = await adminDb.collection("users").doc(borrow.userId).get();
  const user = userDoc.data() as AppUser | undefined;
  if (user?.lineId) {
    await notifyAdmin(LINE_EVENTS.BORROW_RETURN(user.nameTH, borrow.item));
  }

  return NextResponse.json({ ok: true });
}
