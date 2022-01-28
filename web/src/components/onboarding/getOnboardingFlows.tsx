import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingHasExistingBusiness } from "@/components/onboarding/OnboardingHasExistingBusiness";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingName";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { FlowType, ProfileError, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared";
import React, { ReactNode } from "react";
import { OnboardingDateOfFormation } from "./OnboardingDateOfFormation";
import { OnboardingExistingEmployees } from "./OnboardingExistingEmployees";

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
              valid: !!profileData.dateOfFormation && !fieldStates.dateOfFormation.invalid,
            },
          ],
        }),
      },
      {
        component: (
          <>
            <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
            <div className="margin-top-205" />
            <OnboardingIndustry />
          </>
        ),
        getErrorMap: () => ({ inline: [{ name: "businessName", valid: !!profileData.businessName }] }),
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
