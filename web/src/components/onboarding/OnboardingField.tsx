import { Content } from "@/components/Content";
import { ProfileFields } from "@/lib/types/types";
import { camelCaseToSentence, setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useContext, useRef } from "react";

interface Props {
  fieldName: ProfileFields;
  fieldOptions?: TextFieldProps;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: () => void;
  error?: boolean;
  validationText?: string;
  disabled?: boolean;
}

export const OnboardingField = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const headerRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    const value = props.valueFilter ? props.valueFilter(event.target.value) : event.target.value;
    const profileData = { ...state.profileData } as Record<
      keyof ProfileData,
      keyof ProfileData[keyof ProfileData]
    >;
    profileData[props.fieldName as keyof ProfileData] = value as keyof ProfileData[keyof ProfileData];
    setProfileData({
      ...profileData,
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const value = props.visualFilter
    ? props.visualFilter((state.profileData[props.fieldName] as string) ?? "")
    : state.profileData[props.fieldName];

  return (
    <div ref={headerRef}>
      {state.displayContent[props.fieldName].contentMd && (
        <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${props.fieldName}`}>
          <Content overrides={{ h2: headerLevelTwo }}>
            {state.displayContent[props.fieldName].contentMd}
          </Content>
        </div>
      )}
      <div className="form-input">
        <TextField
          value={value ?? ""}
          id={props.fieldName}
          onChange={handleChange}
          onBlur={props.onValidation}
          onSubmit={props.onValidation}
          error={props.error}
          helperText={props.error ? props.validationText ?? " " : " "}
          variant="outlined"
          fullWidth
          placeholder={
            (state.displayContent[props.fieldName] as Record<string, string | undefined>).placeholder ?? ""
          }
          {...props.fieldOptions}
          inputProps={{
            "aria-label": camelCaseToSentence(props.fieldName),
            ...props.fieldOptions?.inputProps,
          }}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
};
