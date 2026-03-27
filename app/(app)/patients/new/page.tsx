"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/lib/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NHSNumberInput } from "@/components/shared/NHSNumberInput";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nhsNumber: "",
    dateOfBirth: "",
    sex: "MALE" as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    gpName: "",
    gpPracticeOdsCode: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await createPatient(form);
      if (result?.error) {
        setError(result.error);
      } else if (result?.patientId) {
        toast.success("Patient registered successfully");
        router.push(`/patients/${result.patientId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Register New Patient</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Patient Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>NHS Number *</Label>
              <NHSNumberInput
                value={form.nhsNumber}
                onChange={(v) => update("nhsNumber", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Sex *</Label>
                <Select
                  value={form.sex}
                  onValueChange={(v) => { if (v) update("sex", v as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address1">Address line 1</Label>
              <Input
                id="address1"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address2">Address line 2</Label>
              <Input
                id="address2"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="city">Town / City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={(e) =>
                    update("postcode", e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">GP Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="gpName">GP Name</Label>
                  <Input
                    id="gpName"
                    value={form.gpName}
                    onChange={(e) => update("gpName", e.target.value)}
                    placeholder="Dr Smith"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gpOds">GP Practice ODS Code</Label>
                  <Input
                    id="gpOds"
                    value={form.gpPracticeOdsCode}
                    onChange={(e) =>
                      update("gpPracticeOdsCode", e.target.value.toUpperCase())
                    }
                    placeholder="A12345"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#005EB8", color: "white" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering…
                  </>
                ) : (
                  "Register Patient"
                )}
              </Button>
              <Link href="/patients">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
