import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;
  const { searchParams } = request.nextUrl;
  const dateStr = searchParams.get("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  const entries = await prisma.mAREntry.findMany({
    where: {
      scheduledAt: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      prescriptionItem: {
        prescription: { patientId },
      },
    },
    include: {
      prescriptionItem: {
        include: {
          dmdProduct: { select: { name: true, cdSchedule: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(entries);
}
