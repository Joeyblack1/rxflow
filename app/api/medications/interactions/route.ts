import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkInteractions } from "@/lib/interactions";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const vtmIds: string[] = body.vtmIds ?? [];

  if (!Array.isArray(vtmIds) || vtmIds.length < 2) {
    return NextResponse.json([]);
  }

  const interactions = await checkInteractions(vtmIds);
  return NextResponse.json(interactions);
}
