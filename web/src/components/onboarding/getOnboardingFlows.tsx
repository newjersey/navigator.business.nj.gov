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
    testIsValid: () => boolean;
    bannerErrorToSet: ProfileError | undefined;
    inlineErrorField: ProfileFields | undefined;
  }[];
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
        testIsValid: () => profileData.hasExistingBusiness !== undefined,
        bannerErrorToSet: "REQUIRED_EXISTING_BUSINESS",
        inlineErrorField: undefined,
      },
      {
        component: (
          <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates} existingBusiness />
        ),
        testIsValid: () => !fieldStates.entityId.invalid,
        bannerErrorToSet: undefined,
        inlineErrorField: "entityId",
      },
      {
        component: (
          <>
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-4" />
            <OnboardingIndustry />
          </>
        ),
        testIsValid: () => !!profileData.businessName,
        bannerErrorToSet: undefined,
        inlineErrorField: "businessName",
      },
      {
        component: <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />,
        testIsValid: () => !!profileData.municipality,
        bannerErrorToSet: undefined,
        inlineErrorField: "municipality",
      },
    ],
  },
  STARTING: {
    pages: [
      {
        component: <OnboardingHasExistingBusiness />,
        testIsValid: () => profileData.hasExistingBusiness !== undefined,
        bannerErrorToSet: "REQUIRED_EXISTING_BUSINESS",
        inlineErrorField: undefined,
      },
      {
        component: <OnboardingBusinessName />,
        testIsValid: () => true,
        bannerErrorToSet: undefined,
        inlineErrorField: undefined,
      },
      {
        component: <OnboardingIndustry />,
        testIsValid: () => true,
        bannerErrorToSet: undefined,
        inlineErrorField: undefined,
      },
      {
        component: <OnboardingLegalStructure />,
        testIsValid: () => profileData.legalStructureId !== undefined,
        bannerErrorToSet: "REQUIRED_LEGAL",
        inlineErrorField: undefined,
      },
      {
        component: <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />,
        testIsValid: () => profileData.municipality !== undefined,
        bannerErrorToSet: undefined,
        inlineErrorField: "municipality",
      },
    ],
  },
});
