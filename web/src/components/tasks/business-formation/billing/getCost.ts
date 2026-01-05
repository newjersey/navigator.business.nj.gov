import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { FormationLegalType } from "@businessnjgovnavigator/shared/formationData";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCost = (field: string, legalType: FormationLegalType): number => {
  const Config = getMergedConfig();
  const overriddenLegalTypes = Object.keys((Config.formation.fields as any)[field].overrides ?? {});
  if (overriddenLegalTypes.includes(legalType)) {
    return Number.parseInt(
      ((Config.formation.fields as any)[field].overrides as any)[legalType].cost,
    );
  }
  return Number.parseInt((Config.formation.fields as any)[field].cost);
};
