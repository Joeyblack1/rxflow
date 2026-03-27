"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

const allergySchema = z.object({
  allergyType: z.enum(["ALLERGY", "INTOLERANCE", "SIDE_EFFECT"]),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "ANAPHYLAXIS", "UNKNOWN"]),
  substanceName: z.string().min(1, "Substance name required"),
  snomedCode: z.string().optional(),
  dmdVtmId: z.string().optional(),
  reactionType: z.string().optional(),
  notes: z.string().optional(),
  onsetDate: z.string().optional(),
});

export async function addAllergy(
  patientId: string,
  data: z.infer<typeof allergySchema>
) {
  const session = await requireSession();
  const parsed = allergySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const allergy = await prisma.allergy.create({
    data: {
      patientId,
      allergyType: parsed.data.allergyType,
      severity: parsed.data.severity,
      substanceName: parsed.data.substanceName,
      snomedCode: parsed.data.snomedCode,
      dmdVtmId: parsed.data.dmdVtmId,
      reactionType: parsed.data.reactionType,
      notes: parsed.data.notes,
      onsetDate: parsed.data.onsetDate
        ? new Date(parsed.data.onsetDate)
        : undefined,
      recordedById: session.id,
      status: "ACTIVE",
    },
  });

  await auditLog({
    userId: session.id,
    patientId,
    action: "ADD_ALLERGY",
    resourceType: "Allergy",
    resourceId: allergy.id,
    newState: allergy as object,
  });

  revalidatePath(`/patients/${patientId}/allergies`);
  revalidatePath(`/patients/${patientId}`);
  return { success: true, allergyId: allergy.id };
}

export async function updateAllergyStatus(
  allergyId: string,
  status: "ACTIVE" | "INACTIVE" | "RESOLVED" | "ENTERED_IN_ERROR"
) {
  const session = await requireSession();

  const allergy = await prisma.allergy.findUnique({
    where: { id: allergyId },
  });
  if (!allergy) return { error: "Allergy not found" };

  const updated = await prisma.allergy.update({
    where: { id: allergyId },
    data: { status },
  });

  await auditLog({
    userId: session.id,
    patientId: allergy.patientId,
    action: "UPDATE_ALLERGY_STATUS",
    resourceType: "Allergy",
    resourceId: allergyId,
    previousState: allergy as object,
    newState: updated as object,
  });

  revalidatePath(`/patients/${allergy.patientId}/allergies`);
  return { success: true };
}
