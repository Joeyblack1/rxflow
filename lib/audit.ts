import { prisma } from "@/lib/db";

interface AuditParams {
  userId?: string;
  patientId?: string;
  prescriptionId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  previousState?: object;
  newState?: object;
  ipAddress?: string;
  isCDAction?: boolean;
}

export async function auditLog(params: AuditParams) {
  await prisma.auditLog.create({ data: { ...params } });
}
