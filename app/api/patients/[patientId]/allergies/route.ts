import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;

  const allergies = await prisma.allergy.findMany({
    where: { patientId },
    orderBy: [{ severity: "desc" }, { recordedAt: "desc" }],
  });

  return NextResponse.json(allergies);
}
