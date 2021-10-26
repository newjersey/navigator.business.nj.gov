import React, { ChangeEvent, FocusEvent, ReactElement, useContext, useRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { camelCaseToSentence, setHeaderRole } from "@/lib/utils/helpers";
import { OnboardingData, ProfileFields } from "@/lib/types/types";

interface Props {
  fieldName: ProfileFields;
  fieldOptions?: TextFieldProps;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: () => void;
  error?: boolean;
  validationText?: string;
  validationLabel?: string;
}

export const OnboardingField = (props: Props): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    const value = props.valueFilter ? props.valueFilter(event.target.value) : event.target.value;
    const onboardingData = { ...state.onboardingData } as Record<
      keyof OnboardingData,
      keyof OnboardingData[keyof OnboardingData]
    >;
    onboardingData[props.fieldName as keyof OnboardingData] =
      value as keyof OnboardingData[keyof OnboardingData];
    setOnboardingData({
      ...onboardingData,
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  const value = props.visualFilter
    ? props.visualFilter((state.onboardingData[props.fieldName] as string) ?? "")
    : state.onboardingData[props.fieldName];

  return (
    <div ref={headerRef}>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent[props.fieldName].contentMd}</Content>
      <div className="form-input margin-top-2">
        <TextField
          value={value ?? ""}
          id={props.fieldName}
          onChange={handleChange}
          onBlur={props.onValidation}
          onSubmit={props.onValidation}
          error={props.error}
          label={props.error && (props.validationLabel ?? "")}
          helperText={props.error && (props.validationText ?? "")}
          variant="outlined"
          fullWidth
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          placeholder={(state.displayContent[props.fieldName] as Record<string, any>).placeholder ?? ""}
          {...props.fieldOptions}
          inputProps={{
            "aria-label": camelCaseToSentence(props.fieldName),
            ...props.fieldOptions?.inputProps,
          }}
        />
      </div>
    </div>
  );
};
