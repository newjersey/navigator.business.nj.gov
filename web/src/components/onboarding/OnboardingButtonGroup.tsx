import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { OnboardingContext } from "@/pages/onboarding";
import React, { ReactElement, useContext } from "react";
import { Button } from "../njwds-extended/Button";

interface Props {
  isFinal: boolean;
}

export const OnboardingButtonGroup = (props: Props): ReactElement => {
  const { state, onBack } = useContext(OnboardingContext);

  const back = (event: React.MouseEvent) => {
    event.preventDefault();
    onBack();
  };

  return (
    <div className="float-right fdr margin-bottom-8">
      {(state.page || 1) > 1 && (
        <Button style="secondary" onClick={back} dataTestid="back">
          {OnboardingDefaults.backButtonText}
        </Button>
      )}
      <Button style="primary" dataTestid="next" typeSubmit noRightMargin>
        {props.isFinal ? OnboardingDefaults.finalNextButtonText : OnboardingDefaults.nextButtonText}
      </Button>
    </div>
  );
};
