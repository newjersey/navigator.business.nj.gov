import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNameAndEmail } from "@/components/onboarding/OnboardingNameAndEmail";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { EssentialQuestionObject, getEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
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
  const inlineEssentialQuestion = getEssentialQuestion(profileData.industryId)
    ? [
        {
          name: getEssentialQuestion(profileData.industryId)?.fieldName as ProfileFields,
          valid:
            profileData[
              (getEssentialQuestion(profileData.industryId) as EssentialQuestionObject).fieldName
            ] !== undefined,
        },
      ]
    : [];
  const snackbarEssentialQuestion = getEssentialQuestion(profileData.industryId)
    ? [
        {
          name: "REQUIRED_ESSENTIAL_QUESTION" as ProfileError,
          valid:
            profileData[
              (getEssentialQuestion(profileData.industryId) as EssentialQuestionObject).fieldName
            ] !== undefined,
        },
      ]
    : [];

  return {
    OWNING: {
      pages: [
        {
          component: (
            <>
              <OnboardingBusinessPersona />
              <div className="padding-top-3">
                <FieldLabelDescriptionOnly fieldName="legalStructureId" />
                <OnboardingLegalStructureDropdown />
              </div>
            </>
          ),
          getErrorMap: () => {
            return {
              banner: [
                { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined },
                { name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined },
              ],
            };
          },
        },
        {
          name: "date-and-entity-id-for-public-filing",
          component: (
            <>
              <FieldLabelOnboarding fieldName="dateOfFormation" />
              <OnboardingDateOfFormation
                onValidation={onValidation}
                fieldStates={fieldStates}
                futureAllowed={false}
              />
              <FieldLabelOnboarding fieldName="entityId" />
              <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates} />
            </>
          ),
          getErrorMap: () => {
            return {
              inline: [
                { name: "entityId", valid: !fieldStates.entityId.invalid },
                {
                  name: "dateOfFormation",
                  valid: !fieldStates.dateOfFormation.invalid,
                },
              ],
              snackbar: [
                { name: "entityId", valid: !fieldStates.entityId.invalid },
                {
                  name: "dateOfFormation",
                  valid: !fieldStates.dateOfFormation.invalid,
                },
              ],
            };
          },
        },
        {
          component: (
            <>
              <FieldLabelOnboarding fieldName="businessName" />
              <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
              <div className="margin-top-205" />
              <FieldLabelOnboarding fieldName="sectorId" />
              <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} />
            </>
          ),
          getErrorMap: () => {
            return {
              inline: [
                { name: "businessName", valid: !!profileData.businessName },
                {
                  name: "sectorId",
                  valid: !!profileData.sectorId,
                },
              ],
              snackbar: [
                { name: "businessName", valid: !!profileData.businessName },
                {
                  name: "sectorId",
                  valid: !!profileData.sectorId,
                },
              ],
            };
          },
        },
        {
          component: (
            <>
              <FieldLabelOnboarding fieldName="existingEmployees" />
              <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />
              <div className="margin-top-205" />
              <FieldLabelOnboarding fieldName="municipality" />
              <div className="margin-top-2">
                <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
              </div>
              <div className="margin-top-205" />
              <FieldLabelOnboarding fieldName="ownershipTypeIds" />
              <OnboardingOwnership />
            </>
          ),
          getErrorMap: () => {
            return {
              inline: [
                {
                  name: "existingEmployees",
                  valid: !!profileData.existingEmployees,
                },
                { name: "municipality", valid: !!profileData.municipality },
              ],
              snackbar: [
                {
                  name: "existingEmployees",
                  valid: !!profileData.existingEmployees,
                },
                { name: "municipality", valid: !!profileData.municipality },
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
