import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import type { FormationLegalType } from "@businessnjgovnavigator/shared/formationData";

export const getCost = (field: string, legalType: FormationLegalType): number => {
  const Config = getMergedConfig();
  const overriddenLegalTypes = Object.keys((Config.formation.fields as any)[field].overrides ?? {});
  if (overriddenLegalTypes.includes(legalType)) {
    return Number.parseInt(
      ((Config.formation.fields as any)[field].overrides as any)[legalType].cost,
      10,
    );
  }
  return Number.parseInt((Config.formation.fields as any)[field].cost, 10);
};
