import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "healthy", db: true, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { status: "unhealthy", db: false, error: String(e) },
      { status: 503 }
    );
  }
}
