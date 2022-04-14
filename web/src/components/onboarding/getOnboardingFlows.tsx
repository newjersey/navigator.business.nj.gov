import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingHasExistingBusiness } from "@/components/onboarding/OnboardingHasExistingBusiness";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNameAndEmail } from "@/components/onboarding/OnboardingNameAndEmail";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { FlowType, ProfileError, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { validateEmail } from "@/lib/utils/helpers";
import { BusinessUser, ProfileData } from "@businessnjgovnavigator/shared";
import React, { ReactNode } from "react";

export type OnboardingFlow = {
  pages: {
    component: ReactNode;
    getErrorMap: () => ErrorFieldMap | undefined;
  }[];
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
        component: <OnboardingHasExistingBusiness />,
        getErrorMap: () => ({
          banner: [
            { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.hasExistingBusiness !== undefined },
          ],
        }),
      },
      {
        component: (
          <>
            <OnboardingDateOfFormation onValidation={onValidation} fieldStates={fieldStates} />
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
  STARTING: {
    pages: [
      {
        component: <OnboardingHasExistingBusiness />,
        getErrorMap: () => ({
          banner: [
            { name: "REQUIRED_EXISTING_BUSINESS", valid: profileData.hasExistingBusiness !== undefined },
          ],
        }),
      },
      {
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
});
