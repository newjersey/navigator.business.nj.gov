/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  isBusinessStartDateValid,
  isDateValid,
} from "@/components/tasks/business-formation/business/BusinessDateValidators";
import { getMergedConfig } from "@/contexts/configContext";
import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
import { FormationFieldErrorState } from "@/lib/types/types";
import { templateEval, validateEmail } from "@/lib/utils/helpers";
import { FormationFields, FormationFormData, NameAvailability } from "@businessnjgovnavigator/shared";

export const getErrorStateForField = (
  field: FormationFields,
  formationFormData: FormationFormData,
  businessNameAvailability: NameAvailability | undefined
): FormationFieldErrorState => {
  const Config = getMergedConfig();

  const errorState = {
    field: field,
    label: (Config.formation.fields as any)[field].fieldDisplayName,
  };

  const fieldWithMaxLength = (params: { required: boolean; maxLen: number }): FormationFieldErrorState => {
    const exists = !!formationFormData[field];
    const isTooLong = (formationFormData[field] as string)?.length > params.maxLen;
    let label = errorState.label;
    const isValid = params.required ? exists && !isTooLong : !isTooLong;
    if (params.required && !exists) {
      label = (Config.formation.fields as any)[field].error;
    } else if (isTooLong) {
      label = templateEval(Config.formation.general.maximumLengthErrorText, {
        field: (Config.formation.fields as any)[field].fieldDisplayName,
        maxLen: params.maxLen.toString(),
      });
    }
    return { ...errorState, label, hasError: !isValid };
  };

  const hasErrorIfEmpty: FormationFields[] = [
    "businessSuffix",
    "contactPhoneNumber",
    "agentNumber",
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
    "addressState",
    "addressCountry",
    "foreignStateOfFormation",
    "addressMunicipality",
  ];

  if (field == "foreignStateOfFormation") {
    return {
      ...errorState,
      hasError: formationFormData.foreignStateOfFormation === undefined,
      label: Config.formation.fields.foreignStateOfFormation.error,
    };
  }

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
      label = Config.formation.fields.businessName.errorInlineEmpty;
    } else if (businessNameAvailability === undefined) {
      label = Config.formation.fields.businessName.errorInlineNeedsToSearch;
    } else if (businessNameAvailability?.status !== "AVAILABLE") {
      label = Config.formation.fields.businessName.errorInlineUnavailable;
    }
    return { ...errorState, label, hasError: !isValid };
  }

  if (field === "businessStartDate") {
    return {
      ...errorState,
      hasError: !isBusinessStartDateValid(formationFormData.businessStartDate, formationFormData.legalType),
    };
  }

  if (field === "foreignDateOfFormation") {
    return {
      ...errorState,
      hasError: !isDateValid(formationFormData.foreignDateOfFormation),
      label: Config.formation.fields.foreignDateOfFormation.error,
    };
  }

  if (["signers", "incorporators"].includes(field)) {
    const newField = field as "signers" | "incorporators";
    const SIGNER_NAME_MAX_LEN = 50;
    const someSignersMissingName = formationFormData[newField]?.some((signer) => {
      return !signer.name.trim();
    });

    const someSignersMissingCheckbox = formationFormData[newField]?.some((signer) => {
      return !signer.signature;
    });

    const someSignersMissingTitle = formationFormData[newField]?.some((signer) => {
      return !signer.title;
    });

    const someSignersTooLong = formationFormData[newField]?.some((signer) => {
      return signer.name.length > SIGNER_NAME_MAX_LEN;
    });

    if (!formationFormData[newField] || formationFormData[newField]?.length === 0) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.signers.errorBannerMinimum,
      };
    } else if (someSignersMissingName) {
      return { ...errorState, hasError: true, label: Config.formation.fields.signers.errorBannerSignerName };
    } else if (someSignersMissingTitle) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.signers.errorBannerSignerTitle,
      };
    } else if (someSignersMissingCheckbox) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.signers.errorBannerCheckbox,
      };
    } else if (someSignersTooLong) {
      return {
        ...errorState,
        hasError: true,
        label: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: (Config.formation.fields as any)[field].fieldDisplayName,
          maxLen: SIGNER_NAME_MAX_LEN.toString(),
        }),
      };
    }
  }

  if (field === "members") {
    if (!formationFormData.members || formationFormData.members?.length === 0) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.directors.error,
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
        label: Config.formation.fields.directors.error,
      };
    }
  }

  if (field === "agentOfficeAddressZipCode") {
    const exists = !!formationFormData[field];
    const inRange = isZipCodeNj(formationFormData[field]);
    const isValid = exists && inRange;
    return { ...errorState, hasError: !isValid };
  }

  if (field === "addressZipCode") {
    const exists = !!formationFormData[field];
    let inRange = false;
    switch (formationFormData.businessLocationType) {
      case "US":
        inRange = isZipCodeUs(formationFormData[field]);
        break;
      case "INTL":
        inRange = isZipCodeIntl(formationFormData[field]);
        break;
      case "NJ":
        inRange = isZipCodeNj(formationFormData[field]);
    }
    const isValid = exists && inRange;
    return { ...errorState, hasError: !isValid };
  }

  if (field === "addressLine1") {
    return fieldWithMaxLength({ required: true, maxLen: 35 });
  }

  if (field === "agentOfficeAddressLine1") {
    return fieldWithMaxLength({ required: true, maxLen: 35 });
  }

  if (field === "addressCity") {
    return fieldWithMaxLength({ required: true, maxLen: 30 });
  }

  if (field === "addressProvince") {
    return fieldWithMaxLength({ required: true, maxLen: 30 });
  }

  if (field === "agentName") {
    return fieldWithMaxLength({ required: true, maxLen: 50 });
  }

  if (field === "contactFirstName") {
    return fieldWithMaxLength({ required: true, maxLen: 50 });
  }

  if (field === "contactLastName") {
    return fieldWithMaxLength({ required: true, maxLen: 50 });
  }

  if (field === "addressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: 35 });
  }

  if (field === "agentOfficeAddressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: 35 });
  }

  if (field === "agentEmail") {
    const emailIsValid = validateEmail(formationFormData.agentEmail);
    if (!emailIsValid) {
      return {
        ...errorState,
        hasError: !emailIsValid,
        label: Config.formation.fields.agentEmail.error,
      };
    }
    return fieldWithMaxLength({ required: true, maxLen: 50 });
  }

  return { ...errorState, hasError: false };
};
