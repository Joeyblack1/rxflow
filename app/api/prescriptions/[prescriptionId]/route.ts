import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrescription } from "@/lib/actions/prescriptions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prescriptionId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prescriptionId } = await params;
  const prescription = await getPrescription(prescriptionId);

  if (!prescription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(prescription);
}
