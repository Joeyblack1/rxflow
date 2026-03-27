import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clinical and operational reports
        </p>
      </div>

      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Reports coming soon</p>
          <p className="text-sm mt-1">
            This section will include prescribing reports, MAR adherence, and audit summaries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
