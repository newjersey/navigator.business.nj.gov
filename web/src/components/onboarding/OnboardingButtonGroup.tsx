import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { OnboardingContext } from "@/pages/onboarding";
import React, { ReactElement, useContext } from "react";
import { Button } from "../njwds-extended/Button";

export const OnboardingButtonGroup = (): ReactElement => {
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
        {OnboardingDefaults.nextButtonText}
      </Button>
    </div>
  );
};
