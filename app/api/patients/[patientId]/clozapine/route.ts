import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateClozapineResult, clozapineAllowsDispensing } from "@/lib/clozapine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;

  const monitoring = await prisma.clozapineMonitoring.findUnique({
    where: { patientId },
    include: {
      results: {
        orderBy: { resultDate: "desc" },
        include: { enteredBy: { select: { name: true } } },
      },
    },
  });

  if (!monitoring) {
    return NextResponse.json(null);
  }

  return NextResponse.json(monitoring);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;
  const body = await request.json();

  const { wbcCount, neutrophilCount, resultDate, notes } = body;

  if (!wbcCount || !neutrophilCount) {
    return NextResponse.json({ error: "WBC and neutrophil counts required" }, { status: 400 });
  }

  const result = calculateClozapineResult(
    parseFloat(wbcCount),
    parseFloat(neutrophilCount)
  );
  const dispensingAuthorised = clozapineAllowsDispensing(result);

  // Upsert monitoring record
  let monitoring = await prisma.clozapineMonitoring.findUnique({
    where: { patientId },
  });

  if (!monitoring) {
    monitoring = await prisma.clozapineMonitoring.create({
      data: { patientId, currentStatus: result, lastResultDate: new Date(resultDate) },
    });
  } else {
    monitoring = await prisma.clozapineMonitoring.update({
      where: { patientId },
      data: { currentStatus: result, lastResultDate: new Date(resultDate) },
    });
  }

  const entry = await prisma.clozapineResultEntry.create({
    data: {
      monitoringId: monitoring.id,
      enteredById: session.id,
      resultDate: new Date(resultDate),
      wbcCount: parseFloat(wbcCount),
      neutrophilCount: parseFloat(neutrophilCount),
      result,
      dispensingAuthorised,
      notes: notes || null,
    },
  });

  return NextResponse.json({ entry, result, dispensingAuthorised });
}
