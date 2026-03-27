import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Users, ArrowLeft, UserPlus } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { organisationId: session.organisationId },
    orderBy: { name: "asc" },
  });

  const roleColour: Record<string, string> = {
    PRESCRIBER: "bg-blue-100 text-blue-800",
    NURSE: "bg-green-100 text-green-800",
    PHARMACIST: "bg-purple-100 text-purple-800",
    PHARMACY_TECHNICIAN: "bg-violet-100 text-violet-800",
    ADMIN: "bg-orange-100 text-orange-800",
    SUPER_ADMIN: "bg-red-100 text-red-800",
    READ_ONLY: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Users
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>GMC Number</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs ${roleColour[user.role] ?? "bg-gray-100"}`}
                    >
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.gmcNumber ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? format(user.lastLoginAt, "dd/MM/yyyy HH:mm")
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.isActive
                          ? "bg-green-100 text-green-800 text-xs"
                          : "bg-gray-100 text-gray-600 text-xs"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
