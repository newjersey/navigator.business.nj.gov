import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { scrollToTop } from "@/lib/utils/helpers";
import React, { ReactElement, useContext } from "react";

interface Props {
  isFinal: boolean;
  isAdditionalBusiness: boolean;
}

export const OnboardingButtonGroup = (props: Props): ReactElement<any> => {
  const { state, onBack } = useContext(ProfileDataContext);
  const { Config } = useConfig();

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
    <div className="margin-bottom-2">
      <ActionBarLayout>
        {(state.page || 1) > 1 && (
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" onClick={back} dataTestId="back">
              {Config.onboardingDefaults.backButtonText}
            </SecondaryButton>
          </div>
        )}
        <div className="mobile-lg:display-inline">
          <PrimaryButton
            isColor="primary"
            dataTestId="next"
            isSubmitButton={true}
            isRightMarginRemoved={true}
          >
            {getText()}
          </PrimaryButton>
        </div>
      </ActionBarLayout>
    </div>
  );
};
