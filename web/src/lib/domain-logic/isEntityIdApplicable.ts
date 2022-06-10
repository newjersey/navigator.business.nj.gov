import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";

export const isEntityIdApplicable = (legalStructureId: string | undefined): boolean =>
  !LookupLegalStructureById(legalStructureId).hasTradeName;
