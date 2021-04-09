import React, { ChangeEvent, ReactElement, useContext } from "react";
import { TextField } from "@material-ui/core";
import { OnboardingButtonGroup } from "./OnboardingButtonGroup";
import { OnboardingContext } from "../../pages/onboarding";

export const OnboardingBusinessName = (): ReactElement => {
  const { state, setOnboardingData, onSubmit } = useContext(OnboardingContext);

  const handleBusinessName = (event: ChangeEvent<HTMLInputElement>): void => {
    setOnboardingData({
      ...state.onboardingData,
      businessName: event.target.value,
    });
  };

  return (
    <form onSubmit={onSubmit} className="usa-prose">
      <h3>{state.displayContent.businessName.title}</h3>
      <p>{state.displayContent.businessName.description}</p>
      <div className="form-input">
        <TextField
          value={state.onboardingData.businessName}
          onChange={handleBusinessName}
          variant="outlined"
          size="small"
          fullWidth
          placeholder={state.displayContent.businessName.placeholder}
          inputProps={{
            "aria-label": "Business name",
          }}
        />
      </div>

      <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
      <OnboardingButtonGroup />
    </form>
  );
};
