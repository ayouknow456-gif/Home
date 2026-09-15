import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { sendLineMessage, notifyAdmin } from "@/lib/line";

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("SHA256", secret).update(body).digest("base64");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  for (const event of body.events ?? []) {
    if (event.type === "message" && event.message?.type === "text") {
      const text: string = event.message.text.trim();
      const lineUserId: string = event.source.userId;

      if (text.startsWith("สมัคร")) {
        // e.g. "สมัคร ชื่อ-นามสกุล เบอร์โทร"
        await adminDb.collection("registrationRequests").add({
          lineUserId,
          rawText: text,
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        await sendLineMessage(
          lineUserId,
          "✅ รับคำขอสมัครสมาชิกแล้ว เจ้าหน้าที่จะติดต่อกลับเร็ว ๆ นี้"
        );
        await notifyAdmin(`📝 มีคำขอสมัครสมาชิกใหม่จาก LINE: ${text}`);
      } else if (text.startsWith("ติดต่อ")) {
        await notifyAdmin(`💬 ข้อความติดต่อจาก LINE (${lineUserId}): ${text}`);
        await sendLineMessage(lineUserId, "ได้รับข้อความแล้ว เจ้าหน้าที่จะตอบกลับเร็ว ๆ นี้");
      }
    }
  }

  return NextResponse.json({ ok: true });
}
