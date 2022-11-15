import {
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  OperatingPhaseId,
} from "@businessnjgovnavigator/shared";

export const isMunicipalityRequired = (params: {
  legalStructureId: string | undefined;
  operatingPhase: OperatingPhaseId;
}) => {
  if (!params.legalStructureId) {
    return true;
  }

  if (LookupLegalStructureById(params.legalStructureId).requiresPublicFiling) {
    return LookupOperatingPhaseById(params.operatingPhase).municipalityRequiredForPublicFiling;
  } else if (LookupLegalStructureById(params.legalStructureId).hasTradeName) {
    return LookupOperatingPhaseById(params.operatingPhase).municipalityRequiredForTradeName;
  } else {
    return true;
  }
};
