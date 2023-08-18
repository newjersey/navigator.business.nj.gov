import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { profileFieldsFromConfig } from "@/lib/types/types";
import {
  camelCaseToKebabCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kebabSnakeSentenceToCamelCase
} from "@/lib/utils/cases-helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingNonprofit = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const fieldName = "isNonprofitOnboardingRadio";

  const { RegisterForOnSubmit } = useFormContextFieldHelpers(fieldName, profileFormContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName as keyof typeof profileFieldsFromConfig
  });

  RegisterForOnSubmit(() => state.profileData[fieldName] !== undefined);

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const value: boolean = event.target.value === "true";
    setProfileData({
      ...state.profileData,
      [fieldName]: value,
      legalStructureId: value ? "nonprofit" : undefined
    });
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label={camelCaseToSentence(fieldName)}
          name={camelCaseToKebabCase(fieldName)}
          value={state.profileData[fieldName]?.toString() ?? ""}
          onChange={handleChange}
          row
        >
          <>
            {["true", "false"].map((val) => {
              return (
                <FormControlLabel
                  key={val}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  data-testid={`${camelCaseToKebabCase(fieldName)}-${val}`}
                  value={val}
                  control={<Radio color="primary" />}
                  label={
                    contentFromConfig[
                      `radioButton${capitalizeFirstLetter(kebabSnakeSentenceToCamelCase(val))}Text`
                    ]
                  }
                />
              );
            })}
          </>
        </RadioGroup>
      </FormControl>
    </>
  );
};
