import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "@/pages/onboarding";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";

export const OnboardingButtonGroup = (): ReactElement => {
  const { state, onBack } = useContext(OnboardingContext);

  const back = (e: React.MouseEvent) => {
    e.preventDefault();
    onBack();
  };

  return (
    <div className="float-right fdr margin-bottom-8">
      {(state.page || 1) > 1 && (
        <button className="usa-button usa-button--outline" onClick={back} data-testid="back">
          {OnboardingDefaults.backButtonText}
        </button>
      )}
      <button type="submit" className="usa-button margin-right-0" data-testid="next">
        {OnboardingDefaults.nextButtonText}
      </button>
    </div>
  );
};
