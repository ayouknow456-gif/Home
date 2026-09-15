import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";
import { notifyAdmin, LINE_EVENTS } from "@/lib/line";
import type { AppUser, Repair } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let query = adminDb.collection("repairs").orderBy("createdAt", "desc");
  if (session.role !== "admin") query = query.where("userId", "==", session.uid) as typeof query;
  const snapshot = await query.get();
  return NextResponse.json({ repairs: snapshot.docs.map((d) => d.data()) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const formData = await req.formData();
  const type = formData.get("type") as Repair["type"];
  const description = formData.get("description") as string;
  const image = formData.get("image") as File | null;
  if (!type || !description) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const imageUrls: string[] = [];
  if (image && image.size > 0) {
    const bucket = adminStorage.bucket();
    const buffer = Buffer.from(await image.arrayBuffer());
    const filePath = `repairs/${session.uid}/${Date.now()}_${image.name}`;
    const file = bucket.file(filePath);
    await file.save(buffer, { contentType: image.type });
    await file.makePublic();
    imageUrls.push(`https://storage.googleapis.com/${bucket.name}/${filePath}`);
  }
  const docRef = adminDb.collection("repairs").doc();
  const now = new Date().toISOString();
  const repair: Repair = { id: docRef.id, userId: session.uid, type, description, imageUrls, status: "pending", createdAt: now, updatedAt: now };
  await docRef.set(repair);
  const userDoc = await adminDb.collection("users").doc(session.uid).get();
  const user = userDoc.data() as AppUser | undefined;
  await notifyAdmin(LINE_EVENTS.REPAIR_REQUEST(user?.nameTH ?? session.username, type, user?.roomNumber ?? ""));
  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
