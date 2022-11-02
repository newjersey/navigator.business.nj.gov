import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileContentField } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import {
  camelCaseToKebabCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kebabSnakeSentenceToCamelCase,
} from "../../lib/utils/helpers";

type ProfileDataTypes = ProfileData[keyof ProfileData];

type Props<T> = {
  fieldName: keyof ProfileData;
  contentFieldName?: ProfileContentField;
  ariaLabel?: string;
  choices: Exclude<T, undefined>[];
  labels?: Record<string, string>;
  onChange?: (value: T) => void;
};

export const OnboardingRadioQuestion = <T extends ProfileDataTypes>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

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
                  style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
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
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (Config.profileDefaults[state.flow] as any)[
                            props.contentFieldName ?? props.fieldName
                          ][
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
