import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";
import { appendToSheet } from "@/lib/sheets";
import { sendLineMessage, LINE_EVENTS } from "@/lib/line";
import type { AppUser, Bill } from "@/lib/types";

const RATE_PER_UNIT = 8; // บาท/หน่วย — ปรับตามอัตราจริงของหอพัก

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  let query = adminDb.collection("bills").orderBy("year", "desc").orderBy("month", "desc");

  if (session.role !== "admin") {
    query = query.where("userId", "==", session.uid) as typeof query;
  } else if (userId) {
    query = query.where("userId", "==", userId) as typeof query;
  }

  const snapshot = await query.get();
  const bills = snapshot.docs.map((d) => d.data());
  return NextResponse.json({ bills });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId, month, year, units } = await req.json();
  if (!userId || !month || !year || units == null) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const amount = Math.round(units * RATE_PER_UNIT);
  const docRef = adminDb.collection("bills").doc();
  const bill: Bill = {
    id: docRef.id,
    userId,
    month,
    year,
    units,
    amount,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  };

  await docRef.set(bill);

  const userDoc = await adminDb.collection("users").doc(userId).get();
  const user = userDoc.data() as AppUser | undefined;

  if (user?.lineId) {
    await sendLineMessage(user.lineId, LINE_EVENTS.BILL_UPDATED(`${month}/${year}`, amount));
  }

  try {
    await appendToSheet("บิลไฟฟ้า", [
      new Date().toISOString(),
      user?.roomNumber ?? "",
      user?.nameTH ?? "",
      month,
      year,
      units,
      amount,
    ]);
  } catch (err) {
    console.error("Sheets append failed:", err);
  }

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
