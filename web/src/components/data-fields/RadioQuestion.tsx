import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField, profileFieldsFromConfig } from "@/lib/types/types";
import {
  camelCaseToKebabCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kebabSnakeSentenceToCamelCase,
} from "@/lib/utils/cases-helpers";
import { ProfileData } from "@businessnjgovnavigator/shared/index";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

type ProfileDataTypes = ProfileData[keyof ProfileData];

type Props<T> = {
  fieldName: keyof ProfileData;
  contentFieldName?: ProfileContentField;
  ariaLabel?: string;
  choices: Exclude<T, undefined>[];
  required?: boolean;
  labels?: Record<string, string>;
  onChange?: (value: T) => void;
};

export const RadioQuestion = <T extends ProfileDataTypes>(props: Props<T>): ReactElement<any> => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const fieldName = props.contentFieldName ?? props.fieldName;

  const { RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(props.fieldName, ProfileFormContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName as keyof typeof profileFieldsFromConfig,
  });

  props.required && RegisterForOnSubmit(() => state.profileData[props.fieldName] !== undefined);

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const value = props.choices.find((val) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return val.toString() === (event.target.value as any).toString();
    }) as T;
    setProfileData({
      ...state.profileData,
      [props.fieldName]: value,
    });
    props.onChange && props.onChange(value);
    setIsValid(true);
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label={props.ariaLabel ?? camelCaseToSentence(props.fieldName)}
          name={camelCaseToKebabCase(props.fieldName)}
          value={state.profileData[props.fieldName]?.toString() ?? ""}
          onChange={handleChange}
          data-testid={`${props.fieldName}-radio-group`}
          row
        >
          <>
            {props.choices.map((val) => {
              return (
                <FormControlLabel
                  key={val.toString()}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  data-testid={`${camelCaseToKebabCase(props.fieldName)}-radio-${val
                    .toString()
                    .toLowerCase()}`}
                  value={val.toString()}
                  control={<Radio color="primary" />}
                  label={
                    props.labels
                      ? props.labels[val.toString()]
                      : contentFromConfig[
                          `radioButton${capitalizeFirstLetter(
                            kebabSnakeSentenceToCamelCase(val.toString())
                          )}Text`
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
