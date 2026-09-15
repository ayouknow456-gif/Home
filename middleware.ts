import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const RESIDENT_PAGES = ["/profile", "/borrow", "/repair", "/bills", "/expenses"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith(ADMIN_PREFIX);
  const isResidentPage = RESIDENT_PAGES.some((p) => pathname.startsWith(p));

  if (!isAdminPage && !isResidentPage) return NextResponse.next();

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPage && session.role !== "admin") {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/borrow/:path*", "/repair/:path*", "/bills/:path*", "/expenses/:path*"],
};
