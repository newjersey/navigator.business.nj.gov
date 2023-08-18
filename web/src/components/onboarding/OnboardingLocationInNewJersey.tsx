import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingLocationInNewJersey = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    "nexusLocationInNewJersey",
    profileFormContext,
    props.errorTypes
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["nexusLocationInNewJersey"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "nexusLocationInNewJersey"
    });

  RegisterForOnSubmit(() => state.profileData["nexusLocationInNewJersey"] !== undefined);
  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    let hasLocationInNJ;
    event.target.value === "true" ? (hasLocationInNJ = true) : (hasLocationInNJ = false);
    Validate(false);
    setProfileData({
      ...state.profileData,
      nexusLocationInNewJersey: hasLocationInNJ,
      homeBasedBusiness: hasLocationInNJ ? false : state.profileData.homeBasedBusiness
    });
  };
  return (
    <>
      <div data-testid="location-in-new-jersey">
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Location in New Jersey"
            name="location-in-new-jersey"
            value={
              state.profileData.nexusLocationInNewJersey === undefined
                ? null
                : state.profileData.nexusLocationInNewJersey
            }
            onChange={handleSelection}
            row
          >
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-true"
              value={true}
              label={contentFromConfig.radioButtonYesText}
              control={<Radio color={isFormFieldInValid ? "error" : "primary"} />}
            />
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid="location-in-new-jersey-false"
              value={false}
              label={contentFromConfig.radioButtonNoText}
              control={<Radio color={isFormFieldInValid ? "error" : "primary"} />}
            />
          </RadioGroup>
        </FormControl>
        <FormHelperText className={"text-error-dark"}>
          {isFormFieldInValid ? contentFromConfig.errorTextRequired : ""}
        </FormHelperText>
      </div>
    </>
  );
};
