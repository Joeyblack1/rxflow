import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PatientContextBanner } from "@/components/patients/PatientContextBanner";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ patientId: string }>;
}

export default async function PatientLayout({ children, params }: LayoutProps) {
  const { patientId } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: { where: { status: "ACTIVE" }, orderBy: { severity: "desc" } },
      clozapineMonitoring: true,
    },
  });

  if (!patient) notFound();

  const tabs = [
    { href: `/patients/${patientId}`, label: "Overview" },
    { href: `/patients/${patientId}/prescriptions`, label: "Prescriptions" },
    { href: `/patients/${patientId}/mar`, label: "MAR" },
    { href: `/patients/${patientId}/allergies`, label: "Allergies" },
    ...(patient.clozapineMonitoring
      ? [{ href: `/patients/${patientId}/clozapine`, label: "Clozapine" }]
      : []),
  ];

  return (
    <div className="-m-6">
      <PatientContextBanner patient={patient} />
      <div className="px-6 pt-4">
        <nav className="flex gap-1 border-b mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
