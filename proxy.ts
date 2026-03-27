import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
