import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingNameAndEmail } from "@/components/onboarding/OnboardingNameAndEmail";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { getEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { isFullNameValid } from "@/lib/domain-logic/isFullNameValid";
import { FlowType, ProfileError, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { validateEmail } from "@/lib/utils/helpers";
import { BusinessUser, ProfileData } from "@businessnjgovnavigator/shared/";
import { ReactNode } from "react";

type OnboardingPage = {
  component: ReactNode;
  getErrorMap: () => ErrorFieldMap | undefined;
  name?: string;
};

export type OnboardingFlow = {
  pages: OnboardingPage[];
};

export type ErrorFieldMap = {
  inline?: { name: ProfileFields; valid: boolean }[];
  banner?: { name: ProfileError; valid: boolean }[];
  snackbar?: { name: ProfileFields; valid: boolean }[];
};

export const getOnboardingFlows = (
  profileData: ProfileData,
  businessUser: BusinessUser,
  onValidation: (field: ProfileFields, invalid: boolean) => void,
  fieldStates: ProfileFieldErrorMap
): Record<FlowType, OnboardingFlow> => {
  const inlineEssentialQuestion = getEssentialQuestion(profileData.industryId).map((essentialQuestion) => ({
    name: essentialQuestion.fieldName as ProfileFields,
    valid: profileData[essentialQuestion.fieldName] !== undefined,
  }));

  const snackbarEssentialQuestion = getEssentialQuestion(profileData.industryId).map((essentialQuestion) => ({
    name: "REQUIRED_ESSENTIAL_QUESTION" as ProfileError,
    valid: profileData[essentialQuestion.fieldName] !== undefined,
  }));

  return {
    OWNING: {
      pages: [
        {
          component: (
            <>
              <OnboardingBusinessPersona />
              <div className="padding-top-3">
                <FieldLabelDescriptionOnly fieldName="legalStructureId" />
                <OnboardingLegalStructureDropdown onValidation={onValidation} fieldStates={fieldStates} />
              </div>
              <div className="padding-top-3">
                <FieldLabelDescriptionOnly fieldName="sectorId" />
                <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} />
              </div>
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [
                { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined },
                {
                  name: "REQUIRED_REVIEW_INFO_BELOW",
                  valid: profileData.legalStructureId !== undefined && profileData.sectorId !== undefined,
                },
              ],
              inline: [
                {
                  name: "legalStructureId",
                  valid: !!profileData.legalStructureId,
                },
                {
                  name: "sectorId",
                  valid: !!profileData.sectorId,
                },
              ],
            };
          },
        },
        {
          component: <OnboardingNameAndEmail onValidation={onValidation} fieldStates={fieldStates} />,
          getErrorMap: () => {
            return {
              inline: [
                {
                  name: "name",
                  valid: isFullNameValid(businessUser.name) && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
              snackbar: [
                {
                  name: "name",
                  valid: isFullNameValid(businessUser.name) && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
            };
          },
        },
      ],
    },
    STARTING: {
      pages: [
        {
          component: <OnboardingBusinessPersona />,
          getErrorMap: () => {
            return {
              banner: [
                { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined },
              ],
            };
          },
        },
        {
          name: "industry-page",
          component: (
            <>
              <FieldLabelOnboarding fieldName="industryId" />
              <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
            </>
          ),
          getErrorMap: () => {
            return {
              inline: [
                { name: "industryId", valid: profileData.industryId !== undefined },
                ...inlineEssentialQuestion,
              ],
              snackbar: [{ name: "industryId", valid: profileData.industryId !== undefined }],
              banner: [...snackbarEssentialQuestion],
            };
          },
        },
        {
          component: (
            <>
              <FieldLabelOnboarding fieldName="legalStructureId" />
              <OnboardingLegalStructure />
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [{ name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined }],
            };
          },
        },
        {
          component: <OnboardingNameAndEmail onValidation={onValidation} fieldStates={fieldStates} />,
          getErrorMap: () => {
            return {
              inline: [
                {
                  name: "name",
                  valid: !!businessUser.name && businessUser.name.length > 0 && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
              snackbar: [
                {
                  name: "name",
                  valid: !!businessUser.name && businessUser.name.length > 0 && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
            };
          },
        },
      ],
    },
    FOREIGN: {
      pages: [
        {
          component: <OnboardingBusinessPersona />,
          getErrorMap: () => {
            return {
              banner: [
                { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined },
              ],
            };
          },
        },
        {
          component: (
            <>
              <FieldLabelOnboarding fieldName="foreignBusinessTypeIds" />
              <OnboardingForeignBusinessType />
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [
                {
                  name: "REQUIRED_FOREIGN_BUSINESS_TYPE",
                  valid: profileData.foreignBusinessType !== undefined,
                },
              ],
            };
          },
        },
        {
          name: "industry-page",
          component: (
            <>
              <FieldLabelOnboarding fieldName="industryId" />
              <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
            </>
          ),
          getErrorMap: () => {
            return {
              inline: [
                { name: "industryId", valid: profileData.industryId !== undefined },
                ...inlineEssentialQuestion,
              ],
              snackbar: [{ name: "industryId", valid: profileData.industryId !== undefined }],
              banner: [...snackbarEssentialQuestion],
            };
          },
        },
        {
          name: "legal-structure-page",
          component: (
            <>
              <FieldLabelOnboarding fieldName="legalStructureId" />
              <OnboardingLegalStructure />
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [{ name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined }],
            };
          },
        },
        {
          name: "municipality-page",
          component: (
            <>
              <FieldLabelOnboarding fieldName="nexusLocationInNewJersey" />
              <OnboardingLocationInNewJersey />
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [
                {
                  name: "REQUIRED_NEXUS_LOCATION_IN_NJ",
                  valid: profileData.nexusLocationInNewJersey !== undefined,
                },
              ],
            };
          },
        },
        {
          component: <OnboardingNameAndEmail onValidation={onValidation} fieldStates={fieldStates} />,
          getErrorMap: () => {
            return {
              inline: [
                {
                  name: "name",
                  valid: !!businessUser.name && businessUser.name.length > 0 && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
              snackbar: [
                {
                  name: "name",
                  valid: !!businessUser.name && businessUser.name.length > 0 && !fieldStates.name.invalid,
                },
                {
                  name: "email",
                  valid:
                    businessUser.email.length > 0 &&
                    !fieldStates.email.invalid &&
                    validateEmail(businessUser.email),
                },
              ],
            };
          },
        },
      ],
    },
  };
};
