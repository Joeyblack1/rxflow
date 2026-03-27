"use client";

import { AdministrationOutcome } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MARCellProps {
  outcome?: AdministrationOutcome | null;
  scheduledAt: Date;
  onClick: () => void;
  disabled?: boolean;
}

const outcomeStyles: Record<string, string> = {
  GIVEN: "bg-green-500 hover:bg-green-600 text-white",
  WITHHELD: "bg-orange-400 hover:bg-orange-500 text-white",
  OMITTED: "bg-red-500 hover:bg-red-600 text-white",
  PATIENT_REFUSED: "bg-blue-400 hover:bg-blue-500 text-white",
  NOT_AVAILABLE: "bg-gray-300 hover:bg-gray-400 text-gray-700",
  PATIENT_ABSENT: "bg-gray-300 hover:bg-gray-400 text-gray-700",
  SEE_NOTES: "bg-purple-400 hover:bg-purple-500 text-white",
};

const outcomeAbbr: Record<string, string> = {
  GIVEN: "G",
  WITHHELD: "W",
  OMITTED: "O",
  PATIENT_REFUSED: "R",
  NOT_AVAILABLE: "NA",
  PATIENT_ABSENT: "AB",
  SEE_NOTES: "SN",
};

export function MARCell({ outcome, scheduledAt, onClick, disabled }: MARCellProps) {
  const now = new Date();
  const isPast = scheduledAt < now;
  const isDue = !outcome && scheduledAt >= now;

  let cellStyle = "bg-gray-100 hover:bg-gray-200 text-gray-500";
  let label = "";

  if (outcome) {
    cellStyle = outcomeStyles[outcome] ?? "bg-gray-200";
    label = outcomeAbbr[outcome] ?? "?";
  } else if (isPast) {
    cellStyle = "bg-red-100 hover:bg-red-200 text-red-600";
    label = "!";
  } else if (isDue) {
    cellStyle = "bg-yellow-100 hover:bg-yellow-200 text-yellow-700";
    label = "→";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-10 h-10 rounded text-xs font-bold transition-colors border",
        cellStyle,
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      title={outcome ?? (isPast ? "Overdue" : "Due")}
    >
      {label}
    </button>
  );
}
