import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatNHSNumber } from "@/lib/nhs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const identifier = searchParams.get("identifier") ?? "";

  // Parse FHIR identifier: https://fhir.nhs.uk/Id/nhs-number|[nhsNumber]
  let nhsNumber: string | null = null;
  if (identifier.includes("|")) {
    nhsNumber = identifier.split("|")[1];
  } else if (identifier) {
    nhsNumber = identifier;
  }

  if (!nhsNumber) {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "required", diagnostics: "identifier parameter required" }],
      },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { nhsNumber: nhsNumber.replace(/\s/g, "") },
  });

  if (!patient) {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-found", diagnostics: "Patient not found" }],
      },
      { status: 404 }
    );
  }

  const fhirPatient = {
    resourceType: "Patient",
    id: patient.id,
    identifier: [
      {
        system: "https://fhir.nhs.uk/Id/nhs-number",
        value: formatNHSNumber(patient.nhsNumber),
      },
    ],
    name: [
      {
        use: "official",
        family: patient.lastName,
        given: [patient.firstName],
      },
    ],
    gender: patient.sex === "MALE" ? "male" : patient.sex === "FEMALE" ? "female" : "other",
    birthDate: patient.dateOfBirth.toISOString().split("T")[0],
    address: patient.addressLine1
      ? [
          {
            line: [patient.addressLine1, patient.addressLine2].filter(Boolean),
            city: patient.city,
            postalCode: patient.postcode,
          },
        ]
      : [],
    deceasedBoolean: patient.isDeceased,
    meta: {
      lastUpdated: patient.updatedAt.toISOString(),
    },
  };

  return NextResponse.json(fhirPatient, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
