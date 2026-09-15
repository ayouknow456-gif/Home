import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.role !== "admin" && session.uid !== params.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const doc = await adminDb.collection("users").doc(params.id).get();
  if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ member: doc.data() });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const updates = await req.json();
  delete updates.uid;
  delete updates.passwordHash;
  await adminDb.collection("users").doc(params.id).update({ ...updates, updatedAt: new Date().toISOString() });
  await adminDb.collection("eventLogs").add({ userId: session.uid, event: "member_updated", detail: `updated ${params.id}`, timestamp: new Date().toISOString(), ip: req.headers.get("x-forwarded-for") ?? "unknown" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await adminDb.collection("users").doc(params.id).update({ status: "moved_out", updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
