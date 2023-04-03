import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

interface Props {
  isFinal: boolean;
}

export const OnboardingButtonGroup = (props: Props): ReactElement => {
  const { state, onBack } = useContext(ProfileDataContext);

  const back = (event: React.MouseEvent): void => {
    event.preventDefault();
    scrollToTop();
    onBack();
  };

  return (
    <div className="float-right fdr margin-bottom-8">
      {(state.page || 1) > 1 && (
        <SecondaryButton isColor="primary" onClick={back} dataTestId="back">
          {Config.onboardingDefaults.backButtonText}
        </SecondaryButton>
      )}
      <PrimaryButton isColor="primary" dataTestId="next" isSubmitButton={true} isRightMarginRemoved={true}>
        {props.isFinal
          ? Config.onboardingDefaults.finalNextButtonText
          : Config.onboardingDefaults.nextButtonText}
      </PrimaryButton>
    </div>
  );
};
