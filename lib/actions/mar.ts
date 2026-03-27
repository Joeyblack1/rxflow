"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { addHours, startOfDay, endOfDay } from "date-fns";

const administrationSchema = z.object({
  outcome: z.enum([
    "GIVEN","WITHHELD","OMITTED","PATIENT_REFUSED","NOT_AVAILABLE","PATIENT_ABSENT","SEE_NOTES"
  ]),
  doseGiven: z.string().optional(),
  reasonCode: z.string().optional(),
  reasonText: z.string().optional(),
  witnessedById: z.string().optional(),
  applicationSite: z.string().optional(),
});

export async function recordAdministration(
  marEntryId: string,
  data: z.infer<typeof administrationSchema>
) {
  const session = await requireSession();
  const parsed = administrationSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const entry = await prisma.mAREntry.findUnique({
    where: { id: marEntryId },
    include: {
      prescriptionItem: {
        include: { prescription: true },
      },
    },
  });
  if (!entry) return { error: "MAR entry not found" };

  const updated = await prisma.mAREntry.update({
    where: { id: marEntryId },
    data: {
      outcome: parsed.data.outcome,
      administeredAt: new Date(),
      administeredById: session.id,
      doseGiven: parsed.data.doseGiven,
      reasonCode: parsed.data.reasonCode,
      reasonText: parsed.data.reasonText,
      witnessedById: parsed.data.witnessedById,
      applicationSite: parsed.data.applicationSite,
    },
  });

  await auditLog({
    userId: session.id,
    patientId: entry.prescriptionItem.prescription.patientId,
    prescriptionId: entry.prescriptionItem.prescription.id,
    action: `MAR_${parsed.data.outcome}`,
    resourceType: "MAREntry",
    resourceId: marEntryId,
    newState: updated as object,
  });

  revalidatePath(
    `/patients/${entry.prescriptionItem.prescription.patientId}/mar`
  );
  return { success: true };
}

export async function generateDailyMAR(patientId: string, date: Date) {
  await requireSession();

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const activePrescriptions = await prisma.prescription.findMany({
    where: {
      patientId,
      status: "ACTIVE",
      startDate: { lte: dayEnd },
      OR: [{ endDate: null }, { endDate: { gte: dayStart } }],
    },
    include: {
      items: {
        where: { isActive: true },
      },
    },
  });

  const frequencyToTimesMap: Record<string, string[]> = {
    OD: ["08:00"],
    BD: ["08:00", "20:00"],
    TDS: ["08:00", "13:00", "20:00"],
    QDS: ["06:00", "12:00", "18:00", "22:00"],
    OM: ["08:00"],
    ON: ["22:00"],
    WEEKLY: ["08:00"],
    FORTNIGHTLY: ["08:00"],
    MONTHLY: ["08:00"],
    STAT: ["08:00"],
    PRN: [],
    VARIABLE: [],
  };

  const createdEntries = [];

  for (const prescription of activePrescriptions) {
    for (const item of prescription.items) {
      const times =
        item.adminTimes.length > 0
          ? item.adminTimes
          : frequencyToTimesMap[item.frequency] ?? [];

      for (const time of times) {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledAt = new Date(date);
        scheduledAt.setHours(hours, minutes, 0, 0);

        const existing = await prisma.mAREntry.findFirst({
          where: {
            prescriptionItemId: item.id,
            scheduledAt,
          },
        });

        if (!existing) {
          const entry = await prisma.mAREntry.create({
            data: {
              prescriptionItemId: item.id,
              scheduledAt,
            },
          });
          createdEntries.push(entry);
        }
      }
    }
  }

  return { created: createdEntries.length };
}
