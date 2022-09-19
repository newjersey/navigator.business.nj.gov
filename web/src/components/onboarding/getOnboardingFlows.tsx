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
import { FlowType, ProfileError, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { validateEmail, validateFullName } from "@/lib/utils/helpers";
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
};

export const getOnboardingFlows = (
  profileData: ProfileData,
  businessUser: BusinessUser,
  onValidation: (field: ProfileFields, invalid: boolean) => void,
  fieldStates: ProfileFieldErrorMap
): Record<FlowType, OnboardingFlow> => ({
  OWNING: {
    pages: [
      {
        component: (
          <>
            <OnboardingBusinessPersona />
            <div className="padding-top-3">
              <OnboardingLegalStructureDropdown />
            </div>
          </>
        ),
        getErrorMap: () => ({
          banner: [
            { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined },
            { name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined },
          ],
        }),
      },
      {
        name: "date-and-entity-id-for-public-filing",
        component: (
          <>
            <OnboardingDateOfFormation
              onValidation={onValidation}
              fieldStates={fieldStates}
              futureAllowed={false}
            />
            <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates} />
          </>
        ),
        getErrorMap: () => ({
          inline: [
            { name: "entityId", valid: !fieldStates.entityId.invalid },
            {
              name: "dateOfFormation",
              valid: !fieldStates.dateOfFormation.invalid,
            },
          ],
        }),
      },
      {
        component: (
          <>
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-205" />
            <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
          </>
        ),
        getErrorMap: () => ({
          inline: [
            { name: "businessName", valid: !!profileData.businessName },
            {
              name: "sectorId",
              valid: !!profileData.sectorId,
            },
          ],
        }),
      },
      {
        component: (
          <>
            <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-205" />
            <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-205" />
            <OnboardingOwnership />
          </>
        ),
        getErrorMap: () => ({
          inline: [
            {
              name: "existingEmployees",
              valid: !!profileData.existingEmployees,
            },
            { name: "municipality", valid: !!profileData.municipality },
          ],
        }),
      },
      {
        component: <OnboardingNameAndEmail onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => {
          return {
            inline: [
              {
                name: "name",
                valid: validateFullName(businessUser.name).isValid && !fieldStates.name.invalid,
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
        getErrorMap: () => ({
          banner: [{ name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined }],
        }),
      },
      {
        name: "industry-page",
        component: <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => ({
          inline: [{ name: "industryId", valid: profileData.industryId !== undefined }],
        }),
      },
      {
        component: <OnboardingLegalStructure />,
        getErrorMap: () => ({
          banner: [{ name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined }],
        }),
      },
      {
        component: <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => ({
          inline: [{ name: "municipality", valid: profileData.municipality !== undefined }],
        }),
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
          };
        },
      },
    ],
  },
  FOREIGN: {
    pages: [
      {
        component: (
          <>
            <OnboardingBusinessPersona />
          </>
        ),
        getErrorMap: () => ({
          banner: [{ name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.businessPersona !== undefined }],
        }),
      },
      {
        component: (
          <>
            <OnboardingForeignBusinessType />
          </>
        ),
        getErrorMap: () => ({
          banner: [
            { name: "REQUIRED_FOREIGN_BUSINESS_TYPE", valid: profileData.foreignBusinessType !== undefined },
          ],
        }),
      },
      {
        name: "industry-page",
        component: <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => ({
          inline: [{ name: "industryId", valid: profileData.industryId !== undefined }],
        }),
      },
      {
        name: "legal-structure-page",
        component: <OnboardingLegalStructure />,
        getErrorMap: () => ({
          banner: [{ name: "REQUIRED_LEGAL", valid: profileData.legalStructureId !== undefined }],
        }),
      },
      {
        name: "municipality-page",
        component: (
          <>
            <OnboardingLocationInNewJersey />
            <div className="margin-top-3">
              {profileData.nexusLocationInNewJersey && (
                <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
              )}
            </div>
          </>
        ),
        getErrorMap: () => ({
          inline: [
            {
              name: "municipality",
              valid:
                profileData.municipality !== undefined ||
                (profileData.municipality === undefined && profileData.nexusLocationInNewJersey === false),
            },
          ],
          banner: [
            {
              name: "REQUIRED_NEXUS_LOCATION_IN_NJ",
              valid: profileData.nexusLocationInNewJersey !== undefined,
            },
          ],
        }),
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
          };
        },
      },
    ],
  },
});
