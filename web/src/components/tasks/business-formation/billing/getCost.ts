import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import type { FormationLegalType } from "@businessnjgovnavigator/shared/formationData";
import { getLegalTypeOverride } from "@/components/tasks/business-formation/formationFieldContent";

type FormationDocumentField =
  | "officialFormationDocument"
  | "certifiedCopyOfFormationDocument"
  | "certificateOfStanding";

export const getCost = (field: FormationDocumentField, legalType: FormationLegalType): number => {
  const Config = getMergedConfig();
  const fieldContent = Config.formation.fields[field];
  const override = getLegalTypeOverride(fieldContent, legalType);
  if (override) {
    return Number.parseInt(override.cost, 10);
  }
  return Number.parseInt(fieldContent.cost, 10);
};
