import { FormationLegalType } from "@businessnjgovnavigator/shared/formationData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/src/contexts/configContext";

const Config = getMergedConfig();

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCost = (field: string, legalType: FormationLegalType): number => {
  const overriddenLegalTypes = Object.keys((Config.formation.fields as any)[field].overrides ?? {});
  if (overriddenLegalTypes.includes(legalType)) {
    return Number.parseInt(
      ((Config.formation.fields as any)[field].overrides as any)[legalType].cost,
    );
  }
  return Number.parseInt((Config.formation.fields as any)[field].cost);
};
