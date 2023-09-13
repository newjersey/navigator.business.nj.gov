import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { BusinessPersona } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingBusinessPersona = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, Validate } = useFormContextFieldHelpers(
    "businessPersona",
    profileFormContext,
    props.errorTypes
  );

  RegisterForOnSubmit(() => state.profileData.businessPersona !== undefined);
  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    Validate(false);
    setProfileData({
      ...state.profileData,
      operatingPhase:
        (event.target.value as BusinessPersona) === "OWNING" ? "GUEST_MODE_OWNING" : "GUEST_MODE",
      businessPersona: event.target.value as BusinessPersona,
    });
  };

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["businessPersona"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "businessPersona",
    });

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-05-override">
        {contentFromConfig.header}
      </div>
      <Content>{contentFromConfig.description}</Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="Business Persona"
          name="business-persona"
          value={state.profileData.businessPersona ?? ""}
          onChange={handleSelection}
        >
          <FormControlLabel
            aria-label="Business Status - Starting"
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="business-persona-starting"
            value="STARTING"
            control={<Radio color="primary" />}
            label={contentFromConfig.radioButtonStartingText}
          />
          <FormControlLabel
            aria-label="Business Status - Owning"
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="business-persona-owning"
            value="OWNING"
            control={<Radio color="primary" />}
            label={contentFromConfig.radioButtonOwningText}
          />
          <FormControlLabel
            aria-label="Business Status - Foreign"
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="business-persona-foreign"
            value="FOREIGN"
            control={<Radio color="primary" />}
            label={contentFromConfig.radioButtonForeignText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};
