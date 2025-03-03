import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { DataFieldFormContext } from "@/contexts/dataFieldFormContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { OutlinedInputProps, TextFieldProps } from "@mui/material";
import { HTMLInputTypeAttribute, ReactElement, useContext } from "react";

export interface ProfileDataFieldProps<T = unknown> extends Omit<GenericTextFieldProps<T>, "fieldName"> {
  fieldName: ProfileContentField;
  fieldOptions?: TextFieldProps;
  inputProps?: OutlinedInputProps;
  type?: HTMLInputTypeAttribute;
  inputWidth?: "full" | "default" | "reduced" | undefined;
}

export const ProfileDataField = <T,>({
  fieldName,
  className,
  ...props
}: ProfileDataFieldProps<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const { Config } = useConfig();

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: fieldName,
  });

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
        formContext={DataFieldFormContext}
        fieldName={fieldName as string}
        {...props}
        validationText={props.validationText ?? contentFromConfig.errorTextRequired ?? ""}
        handleChange={handleChange}
      />
    </div>
  );
};
