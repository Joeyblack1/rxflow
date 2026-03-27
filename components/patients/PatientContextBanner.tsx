import { formatNHSNumber } from "@/lib/nhs";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface Allergy {
  id: string;
  substanceName: string;
  severity: string;
  allergyType: string;
}

interface PatientContextBannerProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nhsNumber: string;
    dateOfBirth: Date;
    sex: string;
    allergies?: Allergy[];
  };
}

const severityStyle: Record<string, string> = {
  ANAPHYLAXIS: "bg-red-600 text-white",
  SEVERE: "bg-orange-500 text-white",
  MODERATE: "bg-yellow-400 text-black",
  MILD: "bg-yellow-200 text-black",
  UNKNOWN: "bg-gray-300 text-black",
};

export function PatientContextBanner({
  patient,
}: PatientContextBannerProps) {
  const activeAllergies = patient.allergies?.filter(
    (a) => ["ANAPHYLAXIS", "SEVERE"].includes(a.severity)
  ) ?? [];

  return (
    <div
      className="sticky top-0 z-10 px-6 py-3 flex items-center gap-6 shadow-sm"
      style={{ backgroundColor: "#003087" }}
    >
      <div>
        <span className="text-white font-bold text-lg">
          {patient.lastName}, {patient.firstName}
        </span>
      </div>
      <div className="text-white/80 text-sm">
        <span className="font-mono">
          NHS: {formatNHSNumber(patient.nhsNumber)}
        </span>
      </div>
      <div className="text-white/80 text-sm">
        DOB: {format(patient.dateOfBirth, "dd/MM/yyyy")}
      </div>
      <div className="text-white/80 text-sm">{patient.sex}</div>

      <div className="ml-auto flex items-center gap-2 flex-wrap">
        {patient.allergies && patient.allergies.length === 0 ? (
          <Badge className="bg-green-600 text-white border-0 text-xs">
            No known allergies
          </Badge>
        ) : patient.allergies === undefined ? null : (
          <>
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            {patient.allergies.map((allergy) => (
              <span
                key={allergy.id}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  severityStyle[allergy.severity] ?? "bg-gray-300 text-black"
                }`}
              >
                {allergy.substanceName}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
