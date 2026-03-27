import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function OrgSettingsPage() {
  const session = await getSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect("/dashboard");
  }

  const org = await prisma.organisation.findFirst({
    where: { id: session.organisationId },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Organisation Settings
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Organisation Name</p>
              <p className="font-medium">{org?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">ODS Code</p>
              <p className="font-medium font-mono">{org?.odsCode}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Setting Type</p>
              <p className="font-medium">{org?.settingType?.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Phone</p>
              <p className="font-medium">{org?.phone ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
