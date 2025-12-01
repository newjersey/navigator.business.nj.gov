import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { BusinessPersona } from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const BusinessPersonaQuestion = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(
    "businessPersona",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  RegisterForOnSubmit(() => state.profileData.businessPersona !== undefined);
  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    setIsValid(true);
    setProfileData({
      ...state.profileData,
      operatingPhase:
        (event.target.value as BusinessPersona) === "OWNING"
          ? OperatingPhaseId.GUEST_MODE_OWNING
          : OperatingPhaseId.GUEST_MODE,
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
      <Heading level={2} className="margin-bottom-05-override">
        {contentFromConfig.header}
      </Heading>
      <Content>{contentFromConfig.description}</Content>
      <FormControl fullWidth>
        <RadioGroup
          name="business-persona"
          value={state.profileData.businessPersona ?? ""}
          onChange={handleSelection}
        >
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="business-persona-starting"
            value="STARTING"
            control={<Radio color="primary" />}
            label={contentFromConfig.radioButtonStartingText}
          />
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="business-persona-owning"
            value="OWNING"
            control={<Radio color="primary" />}
            label={contentFromConfig.radioButtonOwningText}
          />
          <FormControlLabel
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
