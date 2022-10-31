import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";

export const isEntityIdApplicable = (legalStructureId: string | undefined): boolean => {
  return !LookupLegalStructureById(legalStructureId).hasTradeName;
};
