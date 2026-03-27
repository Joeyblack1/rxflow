import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  // Organisation
  const org = await prisma.organisation.upsert({
    where: { odsCode: "RY3" },
    update: {},
    create: {
      name: "Bassetlaw Community Mental Health Team",
      odsCode: "RY3",
      settingType: "COMMUNITY_MH",
      address: "Retford Hospital, North Road, Retford, Nottinghamshire, DN22 7XF",
      phone: "01777 274300",
    },
  });
  console.log("✓ Organisation created:", org.name);

  const hash = await bcrypt.hash("Password1!", 10);

  // Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "dr.joseph@rxflow.nhs" },
      update: {},
      create: {
        organisationId: org.id,
        email: "dr.joseph@rxflow.nhs",
        passwordHash: hash,
        name: "Dr Joseph Ogage",
        role: "PRESCRIBER",
        gmcNumber: "7654321",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "nurse.sarah@rxflow.nhs" },
      update: {},
      create: {
        organisationId: org.id,
        email: "nurse.sarah@rxflow.nhs",
        passwordHash: hash,
        name: "Sarah Mitchell",
        role: "NURSE",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "pharma.james@rxflow.nhs" },
      update: {},
      create: {
        organisationId: org.id,
        email: "pharma.james@rxflow.nhs",
        passwordHash: hash,
        name: "James Chen",
        role: "PHARMACIST",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@rxflow.nhs" },
      update: {},
      create: {
        organisationId: org.id,
        email: "admin@rxflow.nhs",
        passwordHash: hash,
        name: "Admin User",
        role: "ADMIN",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "readonly@rxflow.nhs" },
      update: {},
      create: {
        organisationId: org.id,
        email: "readonly@rxflow.nhs",
        passwordHash: hash,
        name: "Audit Observer",
        role: "READ_ONLY",
        isActive: true,
      },
    }),
  ]);
  console.log("✓ Users created:", users.map((u) => u.email).join(", "));

  const [prescriber, , pharmacist] = users;

  // Patients
  const patient1 = await prisma.patient.upsert({
    where: { nhsNumber: "9434765919" },
    update: {},
    create: {
      nhsNumber: "9434765919",
      firstName: "John",
      lastName: "Smith",
      dateOfBirth: new Date("1965-03-15"),
      sex: "MALE",
      addressLine1: "12 Church Lane",
      city: "Worksop",
      postcode: "S80 2PF",
      gpName: "Dr A Williams",
      gpPracticeOdsCode: "C81001",
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { nhsNumber: "9000000009" },
    update: {},
    create: {
      nhsNumber: "9000000009",
      firstName: "Mary",
      lastName: "Jones",
      dateOfBirth: new Date("1978-07-22"),
      sex: "FEMALE",
      addressLine1: "45 Park Avenue",
      city: "Retford",
      postcode: "DN22 6BJ",
      gpName: "Dr B Patel",
      gpPracticeOdsCode: "C81002",
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { nhsNumber: "9000000025" },
    update: {},
    create: {
      nhsNumber: "9000000025",
      firstName: "Robert",
      lastName: "Brown",
      dateOfBirth: new Date("1955-11-30"),
      sex: "MALE",
      addressLine1: "8 Mill Road",
      city: "Nottingham",
      postcode: "NG1 1AA",
      gpName: "Dr C Singh",
      gpPracticeOdsCode: "C81003",
    },
  });
  console.log("✓ Patients created:", [patient1, patient2, patient3].map((p) => `${p.firstName} ${p.lastName}`).join(", "));

  // Allergies for patient 1
  await prisma.allergy.upsert({
    where: { id: "allergy-penicillin" },
    update: {},
    create: {
      id: "allergy-penicillin",
      patientId: patient1.id,
      allergyType: "ALLERGY",
      severity: "SEVERE",
      substanceName: "Penicillin",
      reactionType: "Anaphylaxis, urticaria",
      status: "ACTIVE",
      recordedById: prescriber.id,
    },
  });

  await prisma.allergy.upsert({
    where: { id: "allergy-haloperidol" },
    update: {},
    create: {
      id: "allergy-haloperidol",
      patientId: patient1.id,
      allergyType: "SIDE_EFFECT",
      severity: "MODERATE",
      substanceName: "Haloperidol",
      reactionType: "Acute dystonia",
      status: "ACTIVE",
      recordedById: prescriber.id,
    },
  });
  console.log("✓ Allergies created for John Smith");

  // DMD Products — 20 common psychiatric drugs
  const drugs = [
    { vmpId: "vmp-001", vtmId: "vtm-001", name: "Olanzapine", formulation: "Tablet", strengthText: "10mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-002", vtmId: "vtm-002", name: "Quetiapine", formulation: "Tablet", strengthText: "200mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-003", vtmId: "vtm-003", name: "Risperidone", formulation: "Tablet", strengthText: "2mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-004", vtmId: "vtm-004", name: "Clozapine", formulation: "Tablet", strengthText: "100mg", cdSchedule: "NON_CD" as const, highAlert: true },
    { vmpId: "vmp-005", vtmId: "vtm-005", name: "Aripiprazole", formulation: "Tablet", strengthText: "10mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-006", vtmId: "vtm-006", name: "Lithium carbonate", formulation: "Tablet (m/r)", strengthText: "400mg", cdSchedule: "NON_CD" as const, highAlert: true },
    { vmpId: "vmp-007", vtmId: "vtm-007", name: "Sodium valproate", formulation: "Tablet (e/c)", strengthText: "200mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-008", vtmId: "vtm-008", name: "Sertraline", formulation: "Tablet", strengthText: "50mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-009", vtmId: "vtm-009", name: "Fluoxetine", formulation: "Capsule", strengthText: "20mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-010", vtmId: "vtm-010", name: "Mirtazapine", formulation: "Tablet", strengthText: "15mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-011", vtmId: "vtm-011", name: "Diazepam", formulation: "Tablet", strengthText: "5mg", cdSchedule: "SCHEDULE_4_PART1" as const },
    { vmpId: "vmp-012", vtmId: "vtm-012", name: "Lorazepam", formulation: "Tablet", strengthText: "1mg", cdSchedule: "SCHEDULE_4_PART1" as const },
    { vmpId: "vmp-013", vtmId: "vtm-013", name: "Haloperidol", formulation: "Tablet", strengthText: "5mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-014", vtmId: "vtm-014", name: "Amisulpride", formulation: "Tablet", strengthText: "200mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-015", vtmId: "vtm-015", name: "Paliperidone", formulation: "Tablet (m/r)", strengthText: "3mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-016", vtmId: "vtm-016", name: "Clonazepam", formulation: "Tablet", strengthText: "0.5mg", cdSchedule: "SCHEDULE_4_PART1" as const },
    { vmpId: "vmp-017", vtmId: "vtm-017", name: "Procyclidine", formulation: "Tablet", strengthText: "5mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-018", vtmId: "vtm-018", name: "Promethazine", formulation: "Tablet", strengthText: "25mg", cdSchedule: "NON_CD" as const },
    { vmpId: "vmp-019", vtmId: "vtm-019", name: "Zopiclone", formulation: "Tablet", strengthText: "7.5mg", cdSchedule: "SCHEDULE_4_PART1" as const },
    { vmpId: "vmp-020", vtmId: "vtm-020", name: "Melatonin", formulation: "Tablet (m/r)", strengthText: "2mg", cdSchedule: "NON_CD" as const },
  ];

  const createdDrugs: Record<string, { id: string; vtmId: string | null }> = {};
  for (const drug of drugs) {
    const created = await prisma.dMDProduct.upsert({
      where: { vmpId: drug.vmpId },
      update: {},
      create: {
        vmpId: drug.vmpId,
        vtmId: drug.vtmId,
        name: drug.name,
        formulation: drug.formulation,
        strengthText: drug.strengthText,
        cdSchedule: drug.cdSchedule,
        highAlert: (drug as { highAlert?: boolean }).highAlert ?? false,
        isActive: true,
      },
    });
    createdDrugs[drug.name] = { id: created.id, vtmId: created.vtmId };
  }
  console.log("✓ DMD Products created:", drugs.map((d) => d.name).join(", "));

  // Drug interactions
  const interactions = [
    {
      drug1VtmId: "vtm-004", // clozapine
      drug2VtmId: "vtm-011", // diazepam
      severity: "SEVERE" as const,
      effect: "Severe respiratory depression and cardiovascular collapse risk",
      management: "Avoid combination. If essential, use lowest possible dose with close monitoring.",
    },
    {
      drug1VtmId: "vtm-006", // lithium
      drug2VtmId: "vtm-008", // sertraline (proxy for NSAID context)
      severity: "MODERATE" as const,
      effect: "Increased risk of lithium toxicity and serotonin syndrome",
      management: "Monitor lithium levels closely. Consider alternative antidepressant.",
    },
    {
      drug1VtmId: "vtm-016", // clonazepam
      drug2VtmId: "vtm-002", // quetiapine
      severity: "MODERATE" as const,
      effect: "Additive CNS depression; increased sedation and respiratory depression risk",
      management: "Use lowest effective doses. Avoid alcohol. Monitor for excessive sedation.",
    },
  ];

  for (const ix of interactions) {
    await prisma.drugInteraction.upsert({
      where: { drug1VtmId_drug2VtmId: { drug1VtmId: ix.drug1VtmId, drug2VtmId: ix.drug2VtmId } },
      update: {},
      create: {
        ...ix,
        lastReviewed: new Date("2025-01-01"),
      },
    });
    // Reverse pair
    await prisma.drugInteraction.upsert({
      where: { drug1VtmId_drug2VtmId: { drug1VtmId: ix.drug2VtmId, drug2VtmId: ix.drug1VtmId } },
      update: {},
      create: {
        drug1VtmId: ix.drug2VtmId,
        drug2VtmId: ix.drug1VtmId,
        severity: ix.severity,
        effect: ix.effect,
        management: ix.management,
        lastReviewed: new Date("2025-01-01"),
      },
    });
  }
  console.log("✓ Drug interactions created");

  // Demo active prescription for patient 1 — olanzapine 10mg OD oral
  const olanzapineId = createdDrugs["Olanzapine"].id;
  const existingRx = await prisma.prescription.findFirst({
    where: { patientId: patient1.id, status: "ACTIVE" },
  });

  if (!existingRx) {
    const rx = await prisma.prescription.create({
      data: {
        patientId: patient1.id,
        prescriberId: prescriber.id,
        pharmacistId: pharmacist.id,
        status: "ACTIVE",
        prescriptionType: "REGULAR",
        prescribedAt: new Date(),
        verifiedAt: new Date(),
        startDate: new Date(),
        indication: "Schizophrenia",
        clinicalNotes: "Stable on olanzapine 10mg OD. Review in 3 months.",
        cdSchedule: "NON_CD",
        items: {
          create: [
            {
              dmdProductId: olanzapineId,
              dose: "10mg",
              doseQuantity: 10,
              doseUnit: "mg",
              route: "ORAL",
              frequency: "OD",
              adminTimes: ["08:00"],
              daysSupply: 28,
              withFood: false,
            },
          ],
        },
      },
    });
    console.log("✓ Demo prescription created for John Smith:", rx.id);
  } else {
    console.log("✓ Demo prescription already exists for John Smith");
  }

  console.log("\n✅ Seed complete!");
  console.log("\nDemo credentials (password: Password1!):");
  console.log("  Prescriber: dr.joseph@rxflow.nhs");
  console.log("  Nurse:      nurse.sarah@rxflow.nhs");
  console.log("  Pharmacist: pharma.james@rxflow.nhs");
  console.log("  Admin:      admin@rxflow.nhs");
  console.log("  Read Only:  readonly@rxflow.nhs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
