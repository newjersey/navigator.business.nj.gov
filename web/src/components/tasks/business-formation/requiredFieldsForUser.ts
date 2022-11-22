import { FormationLegalType } from "@businessnjgovnavigator/shared";
import {
  corpLegalStructures,
  FormationFields,
  FormationFormData,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/formationData";

export const requiredFieldsForUser = (
  legalStructureId: FormationLegalType,
  formationFormData: FormationFormData
): FormationFields[] => {
  let requiredFields: FormationFields[] = [
    "businessName",
    "businessSuffix",
    "businessStartDate",
    "addressMunicipality",
    "addressLine1",
    "addressZipCode",
    "paymentType",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
  ];

  if (formationFormData.agentNumberOrManual === "NUMBER") {
    requiredFields = [...requiredFields, "agentNumber"];
  }

  if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
    requiredFields = [
      ...requiredFields,
      "agentName",
      "agentEmail",
      "agentOfficeAddressLine1",
      "agentOfficeAddressMunicipality",
      "agentOfficeAddressZipCode",
    ];
  }
  if (incorporationLegalStructures.includes(legalStructureId)) {
    requiredFields.push("incorporators");
  } else {
    requiredFields.push("signers");
  }

  if (corpLegalStructures.includes(legalStructureId)) {
    requiredFields = [...requiredFields, "businessTotalStock", "members"];
  }

  if (legalStructureId === "limited-partnership") {
    requiredFields = [
      ...requiredFields,
      "withdrawals",
      "combinedInvestment",
      "dissolution",
      "canCreateLimitedPartner",
      "canGetDistribution",
      "canMakeDistribution",
    ];

    if (formationFormData.canCreateLimitedPartner) {
      requiredFields.push("createLimitedPartnerTerms");
    }
    if (formationFormData.canGetDistribution) {
      requiredFields.push("getDistributionTerms");
    }
    if (formationFormData.canMakeDistribution) {
      requiredFields.push("makeDistributionTerms");
    }
  }

  return requiredFields;
};
