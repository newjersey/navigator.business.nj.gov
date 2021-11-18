import { LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const isEntityIdApplicable = (legalStructureId: string | undefined): boolean =>
  legalStructureId ? !LookupLegalStructureById(legalStructureId).hasTradeName : false;
