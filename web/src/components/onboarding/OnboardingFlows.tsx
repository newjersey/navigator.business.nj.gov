import { BusinessPersonaQuestion } from "@/components/data-fields/BusinessPersonaQuestion";
import { ForeignBusinessTypeField } from "@/components/data-fields/ForeignBusinessTypeField";
import { Industry } from "@/components/data-fields/Industry";
import { NonprofitQuestion } from "@/components/data-fields/NonprofitQuestion";
import { Sectors } from "@/components/data-fields/Sectors";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
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
            <BusinessPersonaQuestion<OnboardingErrors>
              errorTypes={["REQUIRED_EXISTING_BUSINESS"]}
              key="initial-question"
            />
            <div className="padding-top-3">
              <FieldLabelDescriptionOnly fieldName="sectorId" />
              <Sectors<OnboardingErrors> errorTypes={["REQUIRED_REVIEW_INFO_BELOW"]} />
            </div>
          </>
        ),
      },
    ],
  },
  STARTING: {
    pages: [
      {
        component: (
          <>
            <BusinessPersonaQuestion<OnboardingErrors>
              errorTypes={["REQUIRED_EXISTING_BUSINESS"]}
              key="initial-question"
            />
          </>
        ),
      },
      {
        name: "industry-page",
        component: (
          <>
            <FieldLabelOnboarding fieldName="isNonprofitOnboardingRadio" />
            <NonprofitQuestion />
            <div className="padding-top-3">
              <FieldLabelOnboarding fieldName="industryId" />
              <Industry<OnboardingErrors>
                essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
                errorTypes={["ALERT_BAR"]}
                onboardingFieldLabel
              />
            </div>
          </>
        ),
      },
      {
        name: "industry-page-without-nonprofit",
        component: (
          <>
            <div className="padding-top-3">
              <FieldLabelOnboarding fieldName="industryId" />
              <Industry<OnboardingErrors>
                essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
                errorTypes={["ALERT_BAR"]}
                onboardingFieldLabel
              />
            </div>
          </>
        ),
      },
    ],
  },
  FOREIGN: {
    pages: [
      {
        component: (
          <>
            <BusinessPersonaQuestion<OnboardingErrors>
              errorTypes={["REQUIRED_EXISTING_BUSINESS"]}
              key="initial-question"
            />
          </>
        ),
      },

      {
        component: (
          <>
            <FieldLabelOnboarding fieldName="foreignBusinessTypeIds" />
            <ForeignBusinessTypeField<OnboardingErrors> errorTypes={["REQUIRED_FOREIGN_BUSINESS_TYPE"]} />
          </>
        ),
      },
      {
        name: "industry-page",
        component: (
          <>
            <FieldLabelOnboarding fieldName="isNonprofitOnboardingRadio" />
            <NonprofitQuestion />
            <div className="padding-top-3">
              <FieldLabelOnboarding fieldName="industryId" />
              <Industry<OnboardingErrors>
                essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
                errorTypes={["ALERT_BAR"]}
                onboardingFieldLabel
              />
            </div>
          </>
        ),
      },
    ],
  },
};
