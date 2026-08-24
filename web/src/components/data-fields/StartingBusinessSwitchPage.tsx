import { OnboardingErrors } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";
import { StartingBusinessIntent } from "@/components/data-fields/StartingBusinessIntent";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { Industry } from "@/components/data-fields/Industry";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";

export const StartingBusinessSwitchPage = (): ReactElement => {
  const businessUser = useUserData().userData?.user;
  const { Config } = useConfig();
  const enableIntentSelection = process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW === "true";
  const userHasMyNJKey = !!businessUser?.myNJUserKey;
  const shouldSeeBusinessIntentPage = enableIntentSelection && !userHasMyNJKey;
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
