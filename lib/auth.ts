import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { SessionPayload, UserRole } from "./types";

const COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set. Generate with: openssl rand -hex 32");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string): Promise<boolean> { return bcrypt.compare(password, hash); }

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_TTL_SECONDS}s`).sign(getSecretKey());
  cookies().set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: SESSION_TTL_SECONDS, path: "/" });
}

export function clearSessionCookie() { cookies().delete(COOKIE_NAME); }

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, getSecretKey()); return payload as unknown as SessionPayload; } catch { return null; }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, getSecretKey()); return payload as unknown as SessionPayload; } catch { return null; }
}

export function requireRole(session: SessionPayload | null, role: UserRole): boolean { return !!session && session.role === role; }

const attempts = new Map<string, number[]>();
export function checkRateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = (attempts.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) { attempts.set(ip, timestamps); return false; }
  timestamps.push(now); attempts.set(ip, timestamps); return true;
}
