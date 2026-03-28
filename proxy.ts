import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login rate limit: 5 attempts per 15 min per IP
  if (pathname === "/login" && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const allowed = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }
  }

  const protectedPaths = [
    "/dashboard",
    "/patients",
    "/pharmacy",
    "/ward",
    "/controlled-drugs",
    "/reports",
    "/admin",
    "/settings",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token = request.cookies.get("rxflow_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
