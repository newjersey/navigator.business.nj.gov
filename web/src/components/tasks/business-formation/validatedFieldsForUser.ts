import { isForeignCorporation, isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import {
  FieldsForErrorHandling,
  FormationFields,
  FormationFormData,
  corpLegalStructures,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/formationData";

export const validatedFieldsForUser = (formationFormData: FormationFormData): FieldsForErrorHandling[] => {
  let validatedFields: FieldsForErrorHandling[] = [
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

  const foreignValidatedFields: FormationFields[] = [
    "addressCity",
    "foreignDateOfFormation",
    "foreignStateOfFormation",
  ];

  switch (formationFormData.businessLocationType) {
    case "US":
      validatedFields = [...validatedFields, ...foreignValidatedFields, "addressState"];
      break;
    case "INTL":
      validatedFields = [...validatedFields, ...foreignValidatedFields, "addressProvince", "addressCountry"];
      break;
    case "NJ":
      validatedFields.push("addressMunicipality");
  }

  if (formationFormData.agentNumberOrManual === "NUMBER") {
    validatedFields = [...validatedFields, "agentNumber"];
  }

  if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
    validatedFields = [
      ...validatedFields,
      "agentName",
      "agentEmail",
      "agentOfficeAddressLine1",
      "agentOfficeAddressLine2",
      "agentOfficeAddressMunicipality",
      "agentOfficeAddressZipCode",
    ];
  }

  if (incorporationLegalStructures.includes(formationFormData.legalType)) {
    validatedFields.push("incorporators");
  } else {
    validatedFields.push("signers");
  }

  if (corpLegalStructures.includes(formationFormData.legalType)) {
    validatedFields = [...validatedFields, "businessTotalStock", "members"];
  }

  if (isForeignCorporationOrNonprofit(formationFormData.legalType)) {
    validatedFields = [...validatedFields, "foreignGoodStandingFile"];
  }

  if (isForeignCorporation(formationFormData.legalType)) {
    validatedFields = [...validatedFields, "willPracticeLaw"];
  }

  if (formationFormData.legalType === "nonprofit") {
    validatedFields = [
      ...validatedFields,
      "isVeteranNonprofit",
      "hasNonprofitBoardMembers",
      "members",
      "incorporators",
    ];

    if (formationFormData.hasNonprofitBoardMembers) {
      validatedFields.push("nonprofitBoardMemberQualificationsSpecified");
      validatedFields.push("nonprofitBoardMemberRightsSpecified");
      validatedFields.push("nonprofitTrusteesMethodSpecified");
      validatedFields.push("nonprofitAssetDistributionSpecified");
    }

    if (formationFormData.nonprofitBoardMemberQualificationsSpecified === "IN_FORM") {
      validatedFields.push("nonprofitBoardMemberQualificationsTerms");
    }

    if (formationFormData.nonprofitBoardMemberRightsSpecified === "IN_FORM") {
      validatedFields.push("nonprofitBoardMemberRightsTerms");
    }

    if (formationFormData.nonprofitTrusteesMethodSpecified === "IN_FORM") {
      validatedFields.push("nonprofitTrusteesMethodTerms");
    }

    if (formationFormData.nonprofitAssetDistributionSpecified === "IN_FORM") {
      validatedFields.push("nonprofitAssetDistributionTerms");
    }
  }

  if (formationFormData.legalType === "limited-partnership") {
    validatedFields = [
      ...validatedFields,
      "withdrawals",
      "combinedInvestment",
      "dissolution",
      "canCreateLimitedPartner",
      "canGetDistribution",
      "canMakeDistribution",
    ];

    if (formationFormData.canCreateLimitedPartner) {
      validatedFields.push("createLimitedPartnerTerms");
    }
    if (formationFormData.canGetDistribution) {
      validatedFields.push("getDistributionTerms");
    }
    if (formationFormData.canMakeDistribution) {
      validatedFields.push("makeDistributionTerms");
    }
  }
  return validatedFields;
};
