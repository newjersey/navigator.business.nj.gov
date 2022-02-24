import { ProfileDataContext } from "@/pages/onboarding";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement, useContext } from "react";
import { Button } from "../njwds-extended/Button";

interface Props {
  isFinal: boolean;
}

export const OnboardingButtonGroup = (props: Props): ReactElement => {
  const { state, onBack } = useContext(ProfileDataContext);

  const back = (event: React.MouseEvent) => {
    event.preventDefault();
    onBack();
  };

  return (
    <div className="float-right fdr margin-bottom-8">
      {(state.page || 1) > 1 && (
        <Button style="secondary" onClick={back} dataTestid="back">
          {Defaults.onboardingDefaults.backButtonText}
        </Button>
      )}
      <Button style="primary" dataTestid="next" typeSubmit noRightMargin>
        {props.isFinal
          ? Defaults.onboardingDefaults.finalNextButtonText
          : Defaults.onboardingDefaults.nextButtonText}
      </Button>
    </div>
  );
};
