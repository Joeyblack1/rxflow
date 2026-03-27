import { ClozapineTrafficLight as TrafficLight } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  status: TrafficLight;
  wbc?: number | null;
  neutrophil?: number | null;
  lastResultDate?: Date | null;
}

const config: Record<
  TrafficLight,
  { bg: string; label: string; dispensing: boolean; text: string }
> = {
  GREEN: {
    bg: "#00703C",
    label: "GREEN",
    dispensing: true,
    text: "Dispensing: AUTHORISED",
  },
  AMBER: {
    bg: "#FFB81C",
    label: "AMBER",
    dispensing: false,
    text: "Dispensing: CAUTION — Seek haematology advice",
  },
  RED: {
    bg: "#D5281B",
    label: "RED",
    dispensing: false,
    text: "Dispensing: NOT AUTHORISED — Clozapine must be stopped",
  },
  INCONCLUSIVE: {
    bg: "#768692",
    label: "INCONCLUSIVE",
    dispensing: false,
    text: "Dispensing: PENDING — Result inconclusive",
  },
};

export function ClozapineTrafficLightDisplay({
  status,
  wbc,
  neutrophil,
  lastResultDate,
}: Props) {
  const c = config[status];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: c.bg }}
      >
        <span className="text-white font-bold text-xl">{c.label}</span>
      </div>

      <div className="text-center space-y-1">
        <p
          className="font-bold text-lg"
          style={{ color: c.bg }}
        >
          {c.text}
        </p>
        {lastResultDate && (
          <p className="text-sm text-muted-foreground">
            Last result: {format(lastResultDate, "dd/MM/yyyy")}
          </p>
        )}
      </div>

      {(wbc !== null && wbc !== undefined) || (neutrophil !== null && neutrophil !== undefined) ? (
        <div className="grid grid-cols-2 gap-4 text-center mt-2">
          <div className="border rounded-lg p-3">
            <p className="text-2xl font-bold">{wbc?.toFixed(1) ?? "—"}</p>
            <p className="text-xs text-muted-foreground">WBC (×10⁹/L)</p>
            <p className="text-xs text-muted-foreground">Normal: ≥3.5</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-2xl font-bold">{neutrophil?.toFixed(1) ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Neutrophils (×10⁹/L)</p>
            <p className="text-xs text-muted-foreground">Normal: ≥2.0</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
