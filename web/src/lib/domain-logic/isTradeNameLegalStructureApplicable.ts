import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";

export const isTradeNameLegalStructureApplicable = (legalStructureId: string | undefined): boolean => {
  return LookupLegalStructureById(legalStructureId).hasTradeName;
};
