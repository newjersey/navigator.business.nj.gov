import type { OnboardingErrors } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { Industry } from "@/components/data-fields/Industry";
import { StartingBusinessIntent } from "@/components/data-fields/StartingBusinessIntent";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { Industry } from "@/components/data-fields/Industry";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";

export const StartingBusinessSwitchPage = (): ReactElement => {
  const { Config } = useConfig();
  const shouldSeeBusinessIntentPage = process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW === "true";
  if (shouldSeeBusinessIntentPage) {
    return (
      <>
        <Heading level={2} className="margin-bottom-05-override">
          {Config.onboardingDefaults.startingBusinessIntent.default.header}
        </Heading>
        <StartingBusinessIntent<OnboardingErrors> errorTypes={["REQUIRED_SELECT_INTENT"]} />
      </>
    );
  } else {
    return (
      <>
        <FieldLabelOnboarding fieldName="industryId" />
        <Industry<OnboardingErrors>
          essentialQuestionErrorTypes={["REQUIRED_ESSENTIAL_QUESTION"]}
          errorTypes={["REQUIRED_REVIEW_INFO_BELOW"]}
          onboardingFieldLabel
        />
      </>
    );
  }
};
