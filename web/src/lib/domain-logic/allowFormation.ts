import { PublicFilingLegalType, publicFilingLegalTypes } from "@businessnjgovnavigator/shared";

export const allowFormation = (legalStructureId: string | undefined): boolean => {
  if (publicFilingLegalTypes.includes(legalStructureId as PublicFilingLegalType)) {
    return true;
  }

  return false;
};
