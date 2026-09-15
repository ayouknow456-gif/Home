import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest, hashPassword } from "@/lib/auth";
import type { AppUser } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb.collection("users").orderBy("roomNumber").get();
  const members = snapshot.docs.map((d) => d.data());
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const required = ["username", "password", "nameTH", "roomNumber"];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `missing field: ${field}` }, { status: 400 });
  }

  const docRef = adminDb.collection("users").doc();
  const now = new Date().toISOString();
  const newUser: AppUser = {
    uid: docRef.id,
    username: body.username,
    passwordHash: await hashPassword(body.password),
    nameTH: body.nameTH,
    nameEN: body.nameEN ?? "",
    phone: body.phone ?? "",
    lineId: body.lineId ?? "",
    roomNumber: body.roomNumber,
    faceDescriptor: [],
    faceImageUrl: "",
    role: "resident",
    status: "active",
    startDate: body.startDate ?? now,
    endDate: body.endDate ?? "",
    birthDate: body.birthDate ?? "",
    idCard: body.idCard ?? { number: "", issueDate: "", expireDate: "", imageUrl: "" },
    passport: body.passport ?? { number: "", country: "", expireDate: "", imageUrl: "" },
    houseRegistration: body.houseRegistration ?? { number: "", address: "", imageUrl: "" },
    monthlyRent: body.monthlyRent ?? 0,
    notes: body.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(newUser);
  await adminDb.collection("eventLogs").add({
    userId: session.uid,
    event: "member_created",
    detail: `created ${newUser.nameTH} (${newUser.roomNumber})`,
    timestamp: now,
    ip: req.headers.get("x-forwarded-for") ?? "unknown",
  });
  return NextResponse.json({ uid: docRef.id }, { status: 201 });
}
