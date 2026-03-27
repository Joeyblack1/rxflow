import { Badge } from "@/components/ui/badge";
import { PrescriptionStatus } from "@/lib/types";

interface Props {
  status: PrescriptionStatus;
}

const statusConfig: Record<
  PrescriptionStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  PENDING_VERIFICATION: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  DISCONTINUED: {
    label: "Discontinued",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export function PrescriptionStatusBadge({ status }: Props) {
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  return (
    <Badge className={`text-xs font-medium border ${config.className}`}>
      {config.label}
    </Badge>
  );
}
