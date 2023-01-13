import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField, ProfileFields, profileFieldsFromConfig } from "@/lib/types/types";
import {
  camelCaseToKebabCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kebabSnakeSentenceToCamelCase,
} from "@/lib/utils/cases-helpers";
import { ProfileData } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

type ProfileDataTypes = ProfileData[keyof ProfileData];

type Props<T> = {
  fieldName: keyof ProfileData;
  contentFieldName?: ProfileContentField;
  ariaLabel?: string;
  choices: Exclude<T, undefined>[];
  labels?: Record<string, string>;
  onChange?: (value: T) => void;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
};

export const OnboardingRadioQuestion = <T extends ProfileDataTypes>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const fieldName = props.contentFieldName ?? props.fieldName;

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName as keyof typeof profileFieldsFromConfig,
  });

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const value = props.choices.find((val) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return val.toString() === (event.target.value as any).toString();
    }) as T;
    setProfileData({
      ...state.profileData,
      [props.fieldName]: value,
    });
    props.onChange && props.onChange(value);
    props.onValidation && props.onValidation(props.fieldName, false);
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label={props.ariaLabel ?? camelCaseToSentence(props.fieldName)}
          name={camelCaseToKebabCase(props.fieldName)}
          value={state.profileData[props.fieldName]?.toString() ?? ""}
          onChange={handleChange}
          row={props.choices.length === 2}
        >
          <>
            {props.choices.map((val) => {
              return (
                <FormControlLabel
                  key={val.toString()}
                  style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "2.5rem" }}
                  labelPlacement="end"
                  data-testid={`${camelCaseToKebabCase(props.fieldName)}-radio-${val
                    .toString()
                    .toLowerCase()}`}
                  value={val.toString()}
                  control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
                  label={
                    <Content>
                      {props.labels
                        ? props.labels[val.toString()]
                        : contentFromConfig[
                            `radioButton${capitalizeFirstLetter(
                              kebabSnakeSentenceToCamelCase(val.toString())
                            )}Text`
                          ]}
                    </Content>
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
