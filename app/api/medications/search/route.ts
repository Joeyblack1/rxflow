import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const products = await prisma.dMDProduct.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brandName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      vmpId: true,
      vtmId: true,
      name: true,
      brandName: true,
      formulation: true,
      strengthText: true,
      cdSchedule: true,
      highAlert: true,
      blackTriangle: true,
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}
