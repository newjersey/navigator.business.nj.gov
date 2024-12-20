import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { OutlinedInputProps, TextFieldProps } from "@mui/material";
import { HTMLInputTypeAttribute, ReactElement, useContext } from "react";

export interface DataFieldProps<T = unknown> extends Omit<GenericTextFieldProps<T>, "fieldName"> {
  fieldName: ProfileContentField;
  fieldOptions?: TextFieldProps;
  inputProps?: OutlinedInputProps;
  type?: HTMLInputTypeAttribute;
}

export const DataField = <T,>({ fieldName, className, ...props }: DataFieldProps<T>): ReactElement<any> => {
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
        formContext={ProfileFormContext}
        fieldName={fieldName as string}
        {...props}
        validationText={props.validationText ?? contentFromConfig.errorTextRequired ?? ""}
        handleChange={handleChange}
      />
    </div>
  );
};
