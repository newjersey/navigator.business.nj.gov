import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { IndustrySpecificDataAddOnFields } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import {
  camelCaseToKabobCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kabobSnakeSentenceToCamelCase,
} from "../../lib/utils/helpers";

type ProfileDataTypes = ProfileData[keyof ProfileData];
interface Props<T> {
  fieldName: keyof ProfileData;
  contentFieldName?: IndustrySpecificDataAddOnFields;
  ariaLabel?: string;
  choices: Exclude<T, undefined>[];
  labels?: Record<string, string>;
  onChange?: (value: T) => void;
}

export const OnboardingRadioQuestion = <T extends ProfileDataTypes>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = props.choices.find((val) => val.toString() === (event.target.value as any).toString()) as T;
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
          name={camelCaseToKabobCase(props.fieldName)}
          value={state.profileData[props.fieldName]?.toString() ?? ""}
          onChange={handleChange}
          row={props.choices.length === 2}
        >
          <>
            {props.choices.map((val) => (
              <FormControlLabel
                key={val.toString()}
                style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
                labelPlacement="end"
                data-testid={`${camelCaseToKabobCase(props.fieldName)}-radio-${val.toString().toLowerCase()}`}
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
                            kabobSnakeSentenceToCamelCase(val.toString())
                          )}Text`
                        ]}
                  </Content>
                }
              />
            ))}
          </>
        </RadioGroup>
      </FormControl>
    </>
  );
};
