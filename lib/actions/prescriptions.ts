"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

const prescriptionItemSchema = z.object({
  dmdProductId: z.string().min(1),
  dose: z.string().min(1),
  doseQuantity: z.number().optional(),
  doseUnit: z.string().optional(),
  route: z.enum([
    "ORAL","SUBLINGUAL","BUCCAL","IM","IV","SC","TOPICAL","PATCH","INHALED","NASAL","RECTAL","INTRATHECAL","OTHER"
  ]),
  frequency: z.enum([
    "OD","BD","TDS","QDS","OM","ON","WEEKLY","FORTNIGHTLY","MONTHLY","STAT","PRN","VARIABLE"
  ]),
  frequencyText: z.string().optional(),
  adminTimes: z.array(z.string()).optional(),
  daysSupply: z.number().optional(),
  quantityToSupply: z.number().optional(),
  quantityUnit: z.string().optional(),
  crushable: z.boolean().optional(),
  withFood: z.boolean().optional(),
  pharmacistNotes: z.string().optional(),
});

const prescriptionSchema = z.object({
  prescriptionType: z.enum([
    "REGULAR","ONCE_ONLY","AS_REQUIRED","SHORT_COURSE","DISCHARGE","OUTPATIENT"
  ]).default("REGULAR"),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  indication: z.string().optional(),
  clinicalNotes: z.string().optional(),
  cdSchedule: z.enum([
    "NON_CD","SCHEDULE_2","SCHEDULE_3","SCHEDULE_4_PART1","SCHEDULE_4_PART2","SCHEDULE_5"
  ]).default("NON_CD"),
  items: z.array(prescriptionItemSchema).min(1),
});

export async function createPrescription(
  patientId: string,
  data: z.infer<typeof prescriptionSchema>
) {
  const session = await requireSession();
  const parsed = prescriptionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      prescriberId: session.id,
      status: "DRAFT",
      prescriptionType: parsed.data.prescriptionType,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      indication: parsed.data.indication,
      clinicalNotes: parsed.data.clinicalNotes,
      cdSchedule: parsed.data.cdSchedule,
      items: {
        create: parsed.data.items.map((item) => ({
          dmdProductId: item.dmdProductId,
          dose: item.dose,
          doseQuantity: item.doseQuantity,
          doseUnit: item.doseUnit,
          route: item.route,
          frequency: item.frequency,
          frequencyText: item.frequencyText,
          adminTimes: item.adminTimes ?? [],
          daysSupply: item.daysSupply,
          quantityToSupply: item.quantityToSupply,
          quantityUnit: item.quantityUnit,
          crushable: item.crushable,
          withFood: item.withFood,
          pharmacistNotes: item.pharmacistNotes,
        })),
      },
    },
    include: { items: true },
  });

  await auditLog({
    userId: session.id,
    patientId,
    prescriptionId: prescription.id,
    action: "CREATE_PRESCRIPTION",
    resourceType: "Prescription",
    resourceId: prescription.id,
    newState: prescription as object,
    isCDAction: parsed.data.cdSchedule !== "NON_CD",
  });

  revalidatePath(`/patients/${patientId}/prescriptions`);
  return { success: true, prescriptionId: prescription.id };
}

export async function verifyPrescription(
  prescriptionId: string,
  notes?: string
) {
  const session = await requireSession();

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: true },
  });
  if (!prescription) return { error: "Prescription not found" };

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: "ACTIVE",
      pharmacistId: session.id,
      verifiedAt: new Date(),
      clinicalNotes: notes
        ? (prescription.clinicalNotes
            ? prescription.clinicalNotes + "\n[Pharmacist]: " + notes
            : "[Pharmacist]: " + notes)
        : prescription.clinicalNotes,
    },
  });

  await auditLog({
    userId: session.id,
    patientId: prescription.patientId,
    prescriptionId,
    action: "VERIFY_PRESCRIPTION",
    resourceType: "Prescription",
    resourceId: prescriptionId,
    previousState: prescription as object,
    newState: updated as object,
  });

  revalidatePath(`/patients/${prescription.patientId}/prescriptions`);
  revalidatePath("/pharmacy");
  return { success: true };
}

export async function discontinuePrescription(
  prescriptionId: string,
  reason: string
) {
  const session = await requireSession();

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
  });
  if (!prescription) return { error: "Prescription not found" };

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: "DISCONTINUED",
      discontinuedAt: new Date(),
      discontinuedReason: reason,
    },
  });

  await auditLog({
    userId: session.id,
    patientId: prescription.patientId,
    prescriptionId,
    action: "DISCONTINUE_PRESCRIPTION",
    resourceType: "Prescription",
    resourceId: prescriptionId,
    previousState: prescription as object,
    newState: updated as object,
  });

  revalidatePath(`/patients/${prescription.patientId}/prescriptions`);
  return { success: true };
}

export async function getPrescription(id: string) {
  await requireSession();
  return prisma.prescription.findUnique({
    where: { id },
    include: {
      items: {
        include: { dmdProduct: true },
      },
      patient: {
        include: {
          allergies: { where: { status: "ACTIVE" } },
        },
      },
      prescriber: { select: { name: true, role: true, gmcNumber: true } },
      pharmacist: { select: { name: true, role: true } },
    },
  });
}
