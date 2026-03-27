type ClozapineTrafficLight = "GREEN" | "AMBER" | "RED" | "INCONCLUSIVE";

export function calculateClozapineResult(
  wbc: number,
  neutrophil: number
): ClozapineTrafficLight {
  if (wbc < 3.0 || neutrophil < 1.5) return "RED";
  if (wbc < 3.5 || neutrophil < 2.0) return "AMBER";
  return "GREEN";
}

export function clozapineAllowsDispensing(
  status: ClozapineTrafficLight
): boolean {
  return status === "GREEN";
}
