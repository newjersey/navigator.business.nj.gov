import {
  corpLegalStructures,
  FormationFields,
  FormationFormData,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/formationData";

export const validatedFieldsForUser = (formationFormData: FormationFormData): FormationFields[] => {
  let requiredFields: FormationFields[] = [
    "businessName",
    "businessSuffix",
    "businessStartDate",
    "addressLine1",
    "addressLine2",
    "addressZipCode",
    "paymentType",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
  ];

  const foreignRequired: FormationFields[] = [
    "addressCity",
    "foreignDateOfFormation",
    "foreignStateOfFormation",
  ];

  switch (formationFormData.businessLocationType) {
    case "US":
      requiredFields = [...requiredFields, ...foreignRequired, "addressState"];
      break;
    case "INTL":
      requiredFields = [...requiredFields, ...foreignRequired, "addressProvince", "addressCountry"];
      break;
    case "NJ":
      requiredFields.push("addressMunicipality");
  }

  if (formationFormData.agentNumberOrManual === "NUMBER") {
    requiredFields = [...requiredFields, "agentNumber"];
  }

  if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
    requiredFields = [
      ...requiredFields,
      "agentName",
      "agentEmail",
      "agentOfficeAddressLine1",
      "agentOfficeAddressLine2",
      "agentOfficeAddressMunicipality",
      "agentOfficeAddressZipCode",
    ];
  }

  if (incorporationLegalStructures.includes(formationFormData.legalType)) {
    requiredFields.push("incorporators");
  } else {
    requiredFields.push("signers");
  }

  if (corpLegalStructures.includes(formationFormData.legalType)) {
    requiredFields = [...requiredFields, "businessTotalStock", "members"];
  }

  if (formationFormData.legalType === "limited-partnership") {
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
