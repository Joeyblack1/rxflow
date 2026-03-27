"use client";

import { useState } from "react";
import { recordAdministration } from "@/lib/actions/mar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MAREntryDetail {
  id: string;
  scheduledAt: Date;
  dmdProductName: string;
  dose: string;
  isCD: boolean;
}

interface AdministrationModalProps {
  entry: MAREntryDetail | null;
  open: boolean;
  onClose: () => void;
  onRecorded: () => void;
}

export function AdministrationModal({
  entry,
  open,
  onClose,
  onRecorded,
}: AdministrationModalProps) {
  const [outcome, setOutcome] = useState<string>("GIVEN");
  const [doseGiven, setDoseGiven] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [witnessedById, setWitnessedById] = useState("");
  const [loading, setLoading] = useState(false);

  if (!entry) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    setLoading(true);
    try {
      const result = await recordAdministration(entry.id, {
        outcome: outcome as any,
        doseGiven: doseGiven || entry.dose,
        reasonText: outcome !== "GIVEN" ? reasonText : undefined,
        witnessedById: witnessedById || undefined,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Administration recorded");
        onRecorded();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Administration</DialogTitle>
        </DialogHeader>
        <div className="text-sm mb-3">
          <p className="font-semibold">{entry.dmdProductName}</p>
          <p className="text-muted-foreground">
            Dose: {entry.dose} · Due:{" "}
            {format(new Date(entry.scheduledAt), "HH:mm dd/MM")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Outcome *</Label>
            <Select value={outcome} onValueChange={(v) => { if (v) setOutcome(v); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GIVEN">Given</SelectItem>
                <SelectItem value="WITHHELD">Withheld</SelectItem>
                <SelectItem value="OMITTED">Omitted</SelectItem>
                <SelectItem value="PATIENT_REFUSED">Patient Refused</SelectItem>
                <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                <SelectItem value="PATIENT_ABSENT">Patient Absent</SelectItem>
                <SelectItem value="SEE_NOTES">See Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Dose given</Label>
            <Input
              value={doseGiven}
              onChange={(e) => setDoseGiven(e.target.value)}
              placeholder={entry.dose}
            />
          </div>

          {outcome !== "GIVEN" && (
            <div className="space-y-1">
              <Label>Reason *</Label>
              <Textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                rows={2}
                required={outcome !== "GIVEN"}
                placeholder="Document reason…"
              />
            </div>
          )}

          {entry.isCD && (
            <div className="space-y-1">
              <Label>Witness (required for CD)</Label>
              <Input
                value={witnessedById}
                onChange={(e) => setWitnessedById(e.target.value)}
                placeholder="Witness name or user ID"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#005EB8", color: "white" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
