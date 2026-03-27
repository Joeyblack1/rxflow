import { prisma } from "@/lib/db";

export async function checkInteractions(vtmIds: string[]) {
  const pairs: { drug1VtmId: string; drug2VtmId: string }[] = [];
  for (let i = 0; i < vtmIds.length; i++) {
    for (let j = i + 1; j < vtmIds.length; j++) {
      pairs.push({ drug1VtmId: vtmIds[i], drug2VtmId: vtmIds[j] });
      pairs.push({ drug1VtmId: vtmIds[j], drug2VtmId: vtmIds[i] });
    }
  }
  if (pairs.length === 0) return [];
  return prisma.drugInteraction.findMany({
    where: { OR: pairs },
    orderBy: { severity: "desc" },
  });
}
