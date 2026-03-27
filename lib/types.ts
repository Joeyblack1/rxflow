// Shared types that mirror Prisma schema enums
export type UserRole =
  | "PRESCRIBER"
  | "NURSE"
  | "PHARMACIST"
  | "PHARMACY_TECHNICIAN"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "READ_ONLY";

export type PrescriptionStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DISCONTINUED"
  | "COMPLETED"
  | "EXPIRED";

export type AdministrationOutcome =
  | "GIVEN"
  | "WITHHELD"
  | "OMITTED"
  | "PATIENT_REFUSED"
  | "NOT_AVAILABLE"
  | "PATIENT_ABSENT"
  | "SEE_NOTES";

export type ClozapineTrafficLight = "GREEN" | "AMBER" | "RED" | "INCONCLUSIVE";

export type CDSchedule =
  | "NON_CD"
  | "SCHEDULE_2"
  | "SCHEDULE_3"
  | "SCHEDULE_4_PART1"
  | "SCHEDULE_4_PART2"
  | "SCHEDULE_5";
