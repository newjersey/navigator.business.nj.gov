import React, { ReactElement, useContext } from "react";
import { OnboardingContext } from "../../pages/onboarding";

export const OnboardingButtonGroup = (): ReactElement => {
  const { state, onBack } = useContext(OnboardingContext);

  const back = (e: React.MouseEvent) => {
    e.preventDefault();
    onBack();
  };

  return (
    <div className="float-right fdr">
      {state.page > 1 && (
        <button className="usa-button usa-button--outline" onClick={back}>
          Back
        </button>
      )}
      <button type="submit" className="usa-button margin-right-0" data-next={true}>
        Next
      </button>
    </div>
  );
};
