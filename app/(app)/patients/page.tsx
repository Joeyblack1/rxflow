import { searchPatients } from "@/lib/actions/patients";
import { formatNHSNumber } from "@/lib/nhs";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, ChevronRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PatientsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const patients = await searchPatients(q ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and manage patient records
          </p>
        </div>
        <Link href="/patients/new">
          <Button style={{ backgroundColor: "#005EB8", color: "white" }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Register New Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search by name or NHS number…"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {q
                  ? `No patients found for "${q}"`
                  : "Search for a patient above"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NHS Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>GP</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-sm">
                      {formatNHSNumber(patient.nhsNumber)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {patient.lastName}, {patient.firstName}
                    </TableCell>
                    <TableCell>
                      {format(patient.dateOfBirth, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{patient.sex}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.gpName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
