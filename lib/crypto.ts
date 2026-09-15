// Field-level AES-256-GCM encryption for sensitive numbers.
import crypto from "crypto";

const ALGO = "aes-256-gcm";
function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error("FIELD_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate with: openssl rand -hex 32");
  return Buffer.from(hex, "hex");
}

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptField(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function maskIdNumber(id: string): string {
  if (id.length < 6) return "•".repeat(id.length);
  return id.slice(0, 1) + "•".repeat(id.length - 5) + id.slice(-4);
}
