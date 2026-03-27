import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/db";
import { auditLog } from "@/lib/audit";

const CLINIVOICE_SECRET = process.env.CLINIVOICE_WEBHOOK_SECRET ?? "";

function verifySignature(body: string, signature: string): boolean {
  if (!CLINIVOICE_SECRET) return false;
  const expected = createHmac("sha256", CLINIVOICE_SECRET)
    .update(body)
    .digest("hex");
  return signature === `sha256=${expected}`;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-clinivoice-signature") ?? "";

  if (CLINIVOICE_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: {
    patientNHSNumber: string;
    drugs: Array<{
      vtmName: string;
      dose: string;
      route: string;
      frequency: string;
    }>;
    transcript: string;
    sessionId: string;
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { nhsNumber: body.patientNHSNumber.replace(/\s/g, "") },
  });

  if (!patient) {
    return NextResponse.json(
      { error: "Patient not found" },
      { status: 404 }
    );
  }

  // Find a prescriber user to assign (system user or first prescriber)
  const prescriber = await prisma.user.findFirst({
    where: { role: "PRESCRIBER", isActive: true },
  });

  if (!prescriber) {
    return NextResponse.json(
      { error: "No prescriber available" },
      { status: 500 }
    );
  }

  // Find or create DMD products by name for the drugs
  const prescriptionItems = [];
  for (const drug of body.drugs) {
    let product = await prisma.dMDProduct.findFirst({
      where: { name: { contains: drug.vtmName, mode: "insensitive" } },
    });

    if (!product) {
      product = await prisma.dMDProduct.create({
        data: {
          vmpId: `voice-${Date.now()}-${Math.random()}`,
          name: drug.vtmName,
          isActive: true,
        },
      });
    }

    prescriptionItems.push({
      dmdProductId: product.id,
      dose: drug.dose || "As directed",
      route: "ORAL" as const,
      frequency: "OD" as const,
      frequencyText: drug.frequency,
      adminTimes: [],
    });
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId: patient.id,
      prescriberId: prescriber.id,
      status: "DRAFT",
      prescriptionType: "REGULAR",
      startDate: new Date(),
      voiceTranscriptId: body.sessionId,
      voiceDraftReviewed: false,
      clinicalNotes: `Voice prescription from CliniVoice session: ${body.sessionId}\n\nTranscript: ${body.transcript}`,
      items: {
        create: prescriptionItems,
      },
    },
  });

  await auditLog({
    patientId: patient.id,
    prescriptionId: prescription.id,
    action: "VOICE_DRAFT_CREATED",
    resourceType: "Prescription",
    resourceId: prescription.id,
    newState: { sessionId: body.sessionId, drugCount: body.drugs.length },
  });

  const reviewUrl = `/patients/${patient.id}/prescriptions/${prescription.id}`;

  return NextResponse.json({
    prescriptionId: prescription.id,
    reviewUrl,
  });
}
