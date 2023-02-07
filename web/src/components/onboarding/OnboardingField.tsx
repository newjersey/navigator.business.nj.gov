import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { IndustrySpecificDataAddOnFields, ProfileContentField, ProfileFields } from "@/lib/types/types";
import { OutlinedInputProps, TextFieldProps } from "@mui/material";
import { HTMLInputTypeAttribute, ReactElement, useContext } from "react";

export interface OnboardingProps extends Omit<GenericTextFieldProps, "onValidation" | "fieldName"> {
  fieldName: Exclude<ProfileContentField, IndustrySpecificDataAddOnFields>;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldOptions?: TextFieldProps;
  inputProps?: OutlinedInputProps;
  type?: HTMLInputTypeAttribute;
}

export const OnboardingField = ({ fieldName, className, ...props }: OnboardingProps): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const { Config } = useConfig();

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName,
  });

  const onValidation = (fieldName: string, invalid: boolean): void => {
    props.onValidation && props.onValidation(fieldName as ProfileFields, invalid);
  };

  const handleChange = (value: string): void => {
    if (props.handleChange) {
      props.handleChange(value);
      return;
    }

    setProfileData({
      ...state.profileData,
      [fieldName]: value,
    });
  };

  return (
    <div className={className}>
      <GenericTextField
        value={state.profileData[fieldName] as string | undefined}
        fieldName={fieldName as string}
        {...props}
        placeholder={props.placeholder ?? contentFromConfig.placeholder ?? ""}
        validationText={props.validationText ?? contentFromConfig.errorTextRequired ?? ""}
        handleChange={handleChange}
        onValidation={onValidation}
      />
    </div>
  );
};
