import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingNameAndEmail } from "@/components/onboarding/OnboardingNameAndEmail";
import { OnboardingNonprofit } from "@/components/onboarding/OnboardingNonprofit";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { FlowType, OnboardingErrors } from "@/lib/types/types";
import { ReactNode } from "react";

type OnboardingPage = {
  component: ReactNode;
  name?: string;
};

export type OnboardingFlow = {
  pages: OnboardingPage[];
};

export const onboardingFlows: Record<FlowType, OnboardingFlow> = {
  OWNING: {
    pages: [
      {
        component: (
          <>
            <OnboardingBusinessPersona<OnboardingErrors> errorTypes={["REQUIRED_EXISTING_BUSINESS"]} />
            <div className="padding-top-3">
              <FieldLabelDescriptionOnly fieldName="sectorId" />
              <OnboardingSectors<OnboardingErrors> errorTypes={["REQUIRED_REVIEW_INFO_BELOW"]} />
            </div>
          </>
        ),
      },
      {
        component: <OnboardingNameAndEmail<OnboardingErrors> errorTypes={["ALERT_BAR"]} />,
      },
    ],
  },
  STARTING: {
    pages: [
      {
        component: (
          <OnboardingBusinessPersona<OnboardingErrors> errorTypes={["REQUIRED_EXISTING_BUSINESS"]} />
        ),
      },
      {
        name: "industry-page",
        component: (
          <>
            <FieldLabelOnboarding fieldName="isNonprofitOnboardingRadio" />
            <OnboardingNonprofit />
            <div className="padding-top-3">
              <FieldLabelOnboarding fieldName="industryId" />
              <OnboardingIndustry<OnboardingErrors>
                essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
                errorTypes={["ALERT_BAR"]}
                onboardingFieldLabel
              />
            </div>
          </>
        ),
      },
      {
        component: <OnboardingNameAndEmail<OnboardingErrors> errorTypes={["ALERT_BAR"]} />,
      },
    ],
  },
  FOREIGN: {
    pages: [
      {
        component: (
          <OnboardingBusinessPersona<OnboardingErrors> errorTypes={["REQUIRED_EXISTING_BUSINESS"]} />
        ),
      },

      {
        component: (
          <>
            <FieldLabelOnboarding fieldName="foreignBusinessTypeIds" />
            <OnboardingForeignBusinessType<OnboardingErrors>
              errorTypes={["REQUIRED_FOREIGN_BUSINESS_TYPE"]}
            />
          </>
        ),
      },
      {
        name: "industry-page",
        component: (
          <>
            <FieldLabelOnboarding fieldName="isNonprofitOnboardingRadio" />
            <OnboardingNonprofit />
            <div className="padding-top-3">
              <FieldLabelOnboarding fieldName="industryId" />
              <OnboardingIndustry<OnboardingErrors>
                essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
                errorTypes={["ALERT_BAR"]}
                onboardingFieldLabel
              />
            </div>
          </>
        ),
      },
      {
        name: "municipality-page",
        component: (
          <>
            <FieldLabelOnboarding fieldName="nexusLocationInNewJersey" />
            <OnboardingLocationInNewJersey<OnboardingErrors> errorTypes={["REQUIRED_NEXUS_LOCATION_IN_NJ"]} />
          </>
        ),
      },
      {
        component: <OnboardingNameAndEmail<OnboardingErrors> errorTypes={["ALERT_BAR"]} />,
      },
    ],
  },
};
