import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";
import { appendToSheet } from "@/lib/sheets";
import { notifyAdmin, LINE_EVENTS } from "@/lib/line";
import type { AppUser, Borrow } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let query = adminDb.collection("borrows").orderBy("borrowDate", "desc");
  if (session.role !== "admin") {
    query = query.where("userId", "==", session.uid) as typeof query;
  }

  const snapshot = await query.get();
  return NextResponse.json({ borrows: snapshot.docs.map((d) => d.data()) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { item, quantity, dueDate, faceVerified } = await req.json();
  if (!item || !dueDate) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (!faceVerified) {
    return NextResponse.json({ error: "face verification required" }, { status: 403 });
  }

  const docRef = adminDb.collection("borrows").doc();
  const now = new Date().toISOString();
  const borrow: Borrow = {
    id: docRef.id,
    userId: session.uid,
    item,
    quantity: quantity ?? 1,
    borrowDate: now,
    dueDate,
    returnDate: null,
    faceVerified: true,
    status: "borrowed",
  };

  await docRef.set(borrow);

  const userDoc = await adminDb.collection("users").doc(session.uid).get();
  const user = userDoc.data() as AppUser | undefined;

  await notifyAdmin(LINE_EVENTS.BORROW_REQUEST(user?.nameTH ?? session.username, item, dueDate));

  try {
    await appendToSheet("การยืม", [now, user?.roomNumber ?? "", user?.nameTH ?? "", item, quantity ?? 1, dueDate]);
  } catch (err) {
    console.error("Sheets append failed:", err);
  }

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
