import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; from?: string; to?: string }>;
}

const PAGE_SIZE = 50;

export default async function AuditLogPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect("/dashboard");
  }

  const { page, from, to } = await searchParams;
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;

  const where: Prisma.AuditLogWhereInput = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Prisma.DateTimeFilter).gte = new Date(from);
    if (to) (where.timestamp as Prisma.DateTimeFilter).lte = new Date(to);
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true } },
        patient: { select: { firstName: true, lastName: true } },
      },
      orderBy: { timestamp: "desc" },
      take: PAGE_SIZE,
      skip: offset,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
          <ClipboardList className="w-5 h-5" />
          Audit Log
        </h1>
      </div>

      <form method="GET" className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-xs text-muted-foreground block mb-0.5">From</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-0.5">To</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>CD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">
                    {format(log.timestamp, "dd/MM/yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.user?.name ?? "System"}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.patient
                      ? `${log.patient.lastName}, ${log.patient.firstName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.resourceType}: {log.resourceId.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    {log.isCDAction && (
                      <Badge className="text-xs bg-purple-100 text-purple-800">
                        CD
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
        </p>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link href={`?page=${currentPage - 1}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            </Link>
          )}
          {currentPage < totalPages && (
            <Link href={`?page=${currentPage + 1}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
