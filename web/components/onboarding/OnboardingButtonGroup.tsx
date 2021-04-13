import React, { ReactElement, useContext } from "react";
import { onKeyPress } from "../../lib/helpers";
import { OnboardingContext } from "../../pages/onboarding";

export const OnboardingButtonGroup = (): ReactElement => {
  const { state, onBack } = useContext(OnboardingContext);

  return (
    <div className="float-right fdr">
      {state.page > 1 && (
        <div
          tabIndex={0}
          role="button"
          className="usa-button usa-button--outline"
          onClick={onBack}
          onKeyPress={(e: React.KeyboardEvent): void => {
            onKeyPress(e, onBack);
          }}
        >
          Back
        </div>
      )}
      <button type="submit" className="usa-button margin-right-0" data-next={true}>
        Next
      </button>
    </div>
  );
};
