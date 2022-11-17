import { getMergedConfig } from "@/contexts/configContext";
import { FormationFieldErrorState, NameAvailability } from "@/lib/types/types";
import { validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import {
  FormationFields,
  FormationFormData,
  getCurrentDate,
  parseDate,
} from "@businessnjgovnavigator/shared";

export const getErrorStateForField = (
  field: FormationFields,
  formationFormData: FormationFormData,
  businessNameAvailability: NameAvailability | undefined
): FormationFieldErrorState => {
  const Config = getMergedConfig();

  const errorState = {
    field: field,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    label: (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[field],
  };

  const hasErrorIfEmpty: FormationFields[] = [
    "businessSuffix",
    "addressMunicipality",
    "addressLine1",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
    "agentNumber",
    "agentName",
    "agentOfficeAddressLine1",
    "agentOfficeAddressMunicipality",
    "businessTotalStock",
    "withdrawals",
    "combinedInvestment",
    "dissolution",
    "createLimitedPartnerTerms",
    "getDistributionTerms",
    "makeDistributionTerms",
    "paymentType",
  ];

  const hasErrorIfUndefined: FormationFields[] = [
    "canCreateLimitedPartner",
    "canGetDistribution",
    "canMakeDistribution",
  ];

  if (hasErrorIfEmpty.includes(field)) {
    return { ...errorState, hasError: !formationFormData[field] };
  }

  if (hasErrorIfUndefined.includes(field)) {
    return { ...errorState, hasError: formationFormData[field] === undefined };
  }

  if (field === "businessName") {
    const exists = !!formationFormData.businessName;
    const isAvailable = businessNameAvailability?.status === "AVAILABLE";
    const isValid = exists && isAvailable;
    let label = errorState.label;
    if (!exists) {
      label = Config.businessFormationDefaults.nameCheckEmptyFieldErrorText;
    } else if (businessNameAvailability === undefined) {
      label = Config.businessFormationDefaults.nameCheckNeedsToSearchErrorText;
    } else if (businessNameAvailability?.status !== "AVAILABLE") {
      label = Config.businessFormationDefaults.nameCheckUnavailableInlineErrorText;
    }
    return { ...errorState, label, hasError: !isValid };
  }

  if (field === "businessStartDate" && !isStartDateValid(formationFormData.businessStartDate)) {
    return { ...errorState, hasError: true };
  }

  if (["signers", "incorporators"].includes(field)) {
    const newField = field as "signers" | "incorporators";
    const someSignersMissingName = formationFormData[newField]?.some((signer) => {
      return !signer.name.trim();
    });
    const someSignersMissingCheckbox = formationFormData[newField]?.some((signer) => {
      return !signer.signature;
    });

    if (!formationFormData[newField] || formationFormData[newField]?.length === 0) {
      return {
        ...errorState,
        hasError: true,
        label: Config.businessFormationDefaults.signerMinimumErrorText,
      };
    } else if (someSignersMissingName) {
      return { ...errorState, hasError: true, label: Config.businessFormationDefaults.signerNameErrorText };
    } else if (someSignersMissingCheckbox) {
      return {
        ...errorState,
        hasError: true,
        label: Config.businessFormationDefaults.signerCheckboxErrorText,
      };
    }
  }

  if (field === "members") {
    if (!formationFormData.members || formationFormData.members?.length === 0) {
      return {
        ...errorState,
        hasError: true,
        label: Config.businessFormationDefaults.directorsMinimumErrorText,
      };
    } else {
      const allValid = formationFormData.members.every((it) => {
        return (
          it.name &&
          it.addressCity &&
          it.addressCity?.length > 0 &&
          it.addressLine1 &&
          it.addressState &&
          it.addressZipCode
        );
      });
      return {
        ...errorState,
        hasError: !allValid,
        label: Config.businessFormationDefaults.directorsMinimumErrorText,
      };
    }
  }

  if (field === "addressZipCode" || field === "agentOfficeAddressZipCode") {
    const exists = !!formationFormData[field];
    const inRange = zipCodeRange(formationFormData[field]);
    const isValid = exists && inRange;
    return { ...errorState, hasError: !isValid };
  }

  if (field === "agentEmail") {
    const exists = !!formationFormData.agentEmail;
    const isValid = validateEmail(formationFormData.agentEmail);
    return { ...errorState, hasError: !(exists && isValid) };
  }

  return { ...errorState, hasError: false };
};

const isStartDateValid = (value: string): boolean => {
  if (!value) {
    return false;
  }
  return parseDate(value).isValid() && parseDate(value).isAfter(getCurrentDate().subtract(1, "day"), "day");
};
