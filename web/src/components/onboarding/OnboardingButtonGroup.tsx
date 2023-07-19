import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

interface Props {
  isFinal: boolean;
  isAdditionalBusiness: boolean;
}

export const OnboardingButtonGroup = (props: Props): ReactElement => {
  const { state, onBack } = useContext(ProfileDataContext);

  const back = (event: React.MouseEvent): void => {
    event.preventDefault();
    scrollToTop();
    onBack();
  };

  const getText = (): string => {
    if (!props.isFinal) {
      return Config.onboardingDefaults.nextButtonText;
    } else if (props.isAdditionalBusiness) {
      return Config.onboardingDefaults.additionalBusinessFinalNextButtonText;
    } else {
      return Config.onboardingDefaults.finalNextButtonText;
    }
  };

  return (
    <div className="float-right fdr margin-bottom-8">
      {(state.page || 1) > 1 && (
        <SecondaryButton isColor="primary" onClick={back} dataTestId="back">
          {Config.onboardingDefaults.backButtonText}
        </SecondaryButton>
      )}
      <PrimaryButton isColor="primary" dataTestId="next" isSubmitButton={true} isRightMarginRemoved={true}>
        {getText()}
      </PrimaryButton>
    </div>
  );
};
