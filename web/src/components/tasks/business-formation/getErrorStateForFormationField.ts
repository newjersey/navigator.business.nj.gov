/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  isBusinessStartDateValid,
  isDateValid,
} from "@/components/tasks/business-formation/business/BusinessDateValidators";
import { isZipCodeIntl } from "@/lib/domain-logic/isZipCodeIntl";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
import { templateEval, validateEmail } from "@/lib/utils/helpers";
import {
  FieldsForErrorHandling,
  FormationFields,
  FormationFormData,
  InputFile,
  NameAvailability,
  AGENT_EMAIL_MAX_CHAR,
  AGENT_NAME_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR,
  BUSINESS_ADDRESS_CITY_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
  BUSINESS_ADDRESS_PROVINCE_MAX_CHAR,
  CONTACT_FIRST_NAME_MAX_CHAR,
  CONTACT_LAST_NAME_MAX_CHAR,
  SIGNER_NAME_MAX_CHAR,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { FormationFieldErrorState } from "@businessnjgovnavigator/shared/types";

export const onlyHasErrorIfEmpty: FormationFields[] = [
  "contactPhoneNumber",
  "agentNumber",
  "businessTotalStock",
  "withdrawals",
  "combinedInvestment",
  "dissolution",
  "createLimitedPartnerTerms",
  "getDistributionTerms",
  "makeDistributionTerms",
  "nonprofitBoardMemberQualificationsTerms",
  "nonprofitBoardMemberRightsTerms",
  "nonprofitTrusteesMethodTerms",
  "nonprofitAssetDistributionTerms",
];

export const onlyHasErrorIfUndefined: FormationFields[] = [
  "canCreateLimitedPartner",
  "canGetDistribution",
  "canMakeDistribution",
  "addressCountry",
  "addressState",
  "willPracticeLaw",
  "isVeteranNonprofit",
  "hasNonprofitBoardMembers",
  "nonprofitBoardMemberQualificationsSpecified",
  "nonprofitBoardMemberRightsSpecified",
  "nonprofitTrusteesMethodSpecified",
  "nonprofitAssetDistributionSpecified",
  "paymentType",
  "businessSuffix",
];

export const getErrorStateForFormationField = (inputParams: {
  field: FieldsForErrorHandling;
  formationFormData: FormationFormData;
  businessNameAvailability?: NameAvailability | undefined;
  foreignGoodStandingFile?: InputFile | undefined;
}): FormationFieldErrorState => {
  const Config = getMergedConfig();
  const { field, formationFormData, businessNameAvailability, foreignGoodStandingFile } =
    inputParams;

  const errorState = {
    field: field,
    label: (Config.formation.fields as any)[field].label,
  };

  // foreignGoodStandingFile must be first in order to prevent type errors
  if (field === "foreignGoodStandingFile") {
    return {
      ...errorState,
      label: Config.formation.fields.foreignGoodStandingFile.errorMessageRequired,
      hasError: !foreignGoodStandingFile,
    };
  }

  const fieldWithMaxLength = (params: {
    required: boolean;
    maxLen: number;
  }): FormationFieldErrorState => {
    const exists = !!formationFormData[field];
    const isTooLong = (formationFormData[field] as string)?.length > params.maxLen;
    let label = errorState.label;
    const isValid = params.required ? exists && !isTooLong : !isTooLong;
    if (params.required && !exists) {
      label = (Config.formation.fields as any)[field].error;
    } else if (isTooLong) {
      label = templateEval(Config.formation.general.maximumLengthErrorText, {
        field: (Config.formation.fields as any)[field].label,
        maxLen: params.maxLen.toString(),
      });
    }
    return { ...errorState, label, hasError: !isValid };
  };

  const fieldWithAssociatedFields = (params: {
    associatedFields: FormationFields[];
    label: string;
  }): FormationFieldErrorState => {
    const exists = !!formationFormData[field];
    const anAssociatedFieldExists = params.associatedFields.some((it) => !!formationFormData[it]);

    let label = errorState.label;
    let isValid = true;

    if (!exists && anAssociatedFieldExists) {
      label = params.label;
      isValid = false;
    }

    return { ...errorState, label, hasError: !isValid };
  };

  const combineErrorStates = (params: {
    firstPriority: FormationFieldErrorState;
    secondPriority: FormationFieldErrorState;
  }): FormationFieldErrorState => {
    let finalState: FormationFieldErrorState = { ...errorState, hasError: false };

    if (params.secondPriority.hasError) {
      finalState = params.secondPriority;
    }

    if (params.firstPriority.hasError) {
      finalState = params.firstPriority;
    }

    return finalState;
  };

  const isForeignUser = (): boolean => {
    return formationFormData.businessLocationType !== "NJ";
  };

  if (field === "foreignStateOfFormation") {
    return {
      ...errorState,
      hasError: formationFormData.foreignStateOfFormation === undefined,
      label: Config.formation.fields.foreignStateOfFormation.error,
    };
  }

  if (onlyHasErrorIfEmpty.includes(field)) {
    return { ...errorState, hasError: !formationFormData[field] };
  }

  if (onlyHasErrorIfUndefined.includes(field)) {
    return { ...errorState, hasError: formationFormData[field] === undefined };
  }

  if (field === "businessName") {
    const exists = !!formationFormData.businessName;
    const isAvailable = businessNameAvailability?.status === "AVAILABLE";
    const isValid = exists && isAvailable;
    const isConfirmed = formationFormData.businessNameConfirmation;
    let label = errorState.label;

    if (!exists) {
      label = Config.formation.fields.businessName.errorInlineEmpty;
    } else if (!isConfirmed) {
      label = Config.formation.fields.businessName.confirmBusinessNameError;
    } else if (businessNameAvailability?.status === undefined) {
      label = Config.formation.fields.businessName.errorInlineNeedsToSearch;
    } else if (businessNameAvailability?.status !== "AVAILABLE") {
      label = undefined;
    }
    return { ...errorState, label, hasError: !isValid };
  }

  if (field === "businessStartDate") {
    return {
      ...errorState,
      hasError: !isBusinessStartDateValid(
        formationFormData.businessStartDate,
        formationFormData.legalType,
      ),
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
      return signer.name.length > SIGNER_NAME_MAX_CHAR;
    });

    if (!formationFormData[newField] || formationFormData[newField]?.length === 0) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.signers.errorBannerMinimum,
      };
    } else if (someSignersMissingName) {
      return {
        ...errorState,
        hasError: true,
        label: Config.formation.fields.signers.errorBannerSignerName,
      };
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
          field: (Config.formation.fields as any)[field].label,
          maxLen: SIGNER_NAME_MAX_CHAR.toString(),
        }),
      };
    }
  }

  if (field === "members") {
    const minimumLength = formationFormData.legalType === "nonprofit" ? 3 : 1;
    if (!formationFormData.members || formationFormData.members?.length < minimumLength) {
      return {
        ...errorState,
        hasError: true,
        label: field,
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
        label: field,
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

    if (isForeignUser()) {
      switch (formationFormData.businessLocationType) {
        case "US":
          inRange = isZipCodeUs(formationFormData[field]);
          break;
        case "INTL":
          inRange = isZipCodeIntl(formationFormData[field]);
          break;
      }
      const isValid = exists && inRange;
      return {
        ...errorState,
        hasError: !isValid,
        label: Config.formation.fields.addressZipCode.error,
      };
    }

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });

    inRange = isZipCodeNj(formationFormData[field]);
    const hasError = exists && !inRange;
    const inRangeError = {
      ...errorState,
      hasError: hasError,
      label: Config.formation.fields.addressZipCode.error,
    };
    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }

  if (field === "addressLine1") {
    if (isForeignUser()) {
      return fieldWithMaxLength({ required: true, maxLen: BUSINESS_ADDRESS_LINE_1_MAX_CHAR });
    }

    const maxLengthError = fieldWithMaxLength({
      required: false,
      maxLen: BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
    });
    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });

    return combineErrorStates({
      firstPriority: maxLengthError,
      secondPriority: partialAddressError,
    });
  }

  if (field === "addressMunicipality") {
    return fieldWithAssociatedFields({
      associatedFields: ["addressLine1", "addressZipCode", "addressLine2"],
      label: (Config.formation.fields as any)[field].error,
    });
  }

  if (field === "agentOfficeAddressLine1") {
    return fieldWithMaxLength({ required: true, maxLen: AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR });
  }

  if (field === "addressCity") {
    return fieldWithMaxLength({ required: true, maxLen: BUSINESS_ADDRESS_CITY_MAX_CHAR });
  }

  if (field === "addressProvince") {
    return fieldWithMaxLength({ required: true, maxLen: BUSINESS_ADDRESS_PROVINCE_MAX_CHAR });
  }

  if (field === "agentName") {
    return fieldWithMaxLength({ required: true, maxLen: AGENT_NAME_MAX_CHAR });
  }

  if (field === "contactFirstName") {
    return fieldWithMaxLength({ required: true, maxLen: CONTACT_FIRST_NAME_MAX_CHAR });
  }

  if (field === "contactLastName") {
    return fieldWithMaxLength({ required: true, maxLen: CONTACT_LAST_NAME_MAX_CHAR });
  }

  if (field === "addressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: BUSINESS_ADDRESS_LINE_2_MAX_CHAR });
  }

  if (field === "agentOfficeAddressLine2") {
    return fieldWithMaxLength({ required: false, maxLen: AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR });
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
    return fieldWithMaxLength({ required: true, maxLen: AGENT_EMAIL_MAX_CHAR });
  }

  if (field === "agentOfficeAddressCity") {
    return fieldWithMaxLength({ required: true, maxLen: AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR });
  }

  return { ...errorState, hasError: false };
};
