import { OnboardingHasExistingBusiness } from "@/components/onboarding/OnboardingHasExistingBusiness";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingName";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import React, { ReactNode } from "react";
import { ProfileError, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared";

export type OnboardingFlow = {
  pages: {
    component: ReactNode;
    getErrorMap: () => ErrorFieldMap | undefined;
  }[];
};

export type ErrorFieldMap = {
  inline?: [{ name: ProfileFields; valid: boolean }];
  banner?: [{ name: ProfileError; valid: boolean }];
};
export type FlowType = "OWNING" | "STARTING";

export const getOnboardingFlows = (
  profileData: ProfileData,
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
        component: <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => ({ inline: [{ name: "entityId", valid: !fieldStates.entityId.invalid }] }),
      },
      {
        component: (
          <>
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-4" />
            <OnboardingIndustry />
          </>
        ),
        getErrorMap: () => ({ inline: [{ name: "businessName", valid: !!profileData.businessName }] }),
      },
      {
        component: <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />,
        getErrorMap: () => ({ inline: [{ name: "municipality", valid: !!profileData.municipality }] }),
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
        component: <OnboardingBusinessName />,
        getErrorMap: () => undefined,
      },
      {
        component: <OnboardingIndustry />,
        getErrorMap: () => undefined,
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
    ],
  },
});
