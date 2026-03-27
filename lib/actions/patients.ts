"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { validateNHSNumber } from "@/lib/nhs";

const patientSchema = z.object({
  nhsNumber: z.string().min(10, "NHS Number required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  gpPracticeOdsCode: z.string().optional(),
  gpName: z.string().optional(),
});

export async function createPatient(data: z.infer<typeof patientSchema>) {
  const session = await requireSession();
  const parsed = patientSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const nhsClean = parsed.data.nhsNumber.replace(/\s/g, "");
  if (!validateNHSNumber(nhsClean)) {
    return { error: "Invalid NHS Number (Modulus 11 check failed)" };
  }

  const existing = await prisma.patient.findUnique({
    where: { nhsNumber: nhsClean },
  });
  if (existing) {
    return { error: "A patient with this NHS Number already exists" };
  }

  const patient = await prisma.patient.create({
    data: {
      nhsNumber: nhsClean,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      sex: parsed.data.sex,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      gpPracticeOdsCode: parsed.data.gpPracticeOdsCode,
      gpName: parsed.data.gpName,
    },
  });

  await auditLog({
    userId: session.id,
    patientId: patient.id,
    action: "CREATE_PATIENT",
    resourceType: "Patient",
    resourceId: patient.id,
    newState: patient as object,
  });

  revalidatePath("/patients");
  return { success: true, patientId: patient.id };
}

export async function searchPatients(query: string) {
  await requireSession();
  const q = query.trim();
  if (!q) {
    return prisma.patient.findMany({
      take: 20,
      orderBy: { lastName: "asc" },
    });
  }

  const nhsClean = q.replace(/\s/g, "");
  return prisma.patient.findMany({
    where: {
      OR: [
        { nhsNumber: { contains: nhsClean } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { lastName: "asc" },
  });
}

export async function getPatient(id: string) {
  await requireSession();
  return prisma.patient.findUnique({
    where: { id },
    include: {
      allergies: {
        where: { status: "ACTIVE" },
        orderBy: { severity: "desc" },
      },
      prescriptions: {
        where: { status: { in: ["ACTIVE", "PENDING_VERIFICATION", "DRAFT"] } },
        include: {
          items: { include: { dmdProduct: true } },
          prescriber: { select: { name: true, role: true } },
        },
        orderBy: { prescribedAt: "desc" },
      },
      clozapineMonitoring: {
        include: {
          results: {
            orderBy: { resultDate: "desc" },
            take: 10,
            include: { enteredBy: { select: { name: true } } },
          },
        },
      },
    },
  });
}
