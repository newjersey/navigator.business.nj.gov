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
    <div className="usa-prose">
      <h3>Hi there! Let’s get your business started.</h3>
      <p className="usa-intro">
        So you're considering opening up a business, how exciting! We're thrilled to be here and make this
        process as seamless as possible. Please fill out the following questions so we can provide you with
        your unique business registration roadmap. This roadmap will guide you through the business
        registration process. At the end of this process you should have registered your business with the
        state, obtained an EIN with the federal government and applied for potential municipal and state
        licenses.
      </p>
      <form onSubmit={onSubmit} className="usa-prose">
        <h3>Business Name</h3>
        <p>
          Have you thought of a name for your business? If you had a name in mind, first we'll need to check
          if that name is available.
        </p>
        <div className="form-input">
          <TextField
            value={state.onboardingData.businessName}
            onChange={handleBusinessName}
            variant="outlined"
            size="small"
            fullWidth
            inputProps={{
              "aria-label": "Business name",
            }}
          />
        </div>

        <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
        <OnboardingButtonGroup />
      </form>
    </div>
  );
};
