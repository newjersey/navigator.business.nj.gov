/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { IndustrySpecificDataAddOnFields, ProfileFields } from "@/lib/types/types";
import { BusinessUser, ProfileData } from "@businessnjgovnavigator/shared/";
import { TextFieldProps } from "@mui/material";
import { ReactElement, useContext } from "react";

export interface OnboardingProps extends Omit<GenericTextFieldProps, "value" | "onValidation" | "fieldName"> {
  fieldName: Exclude<ProfileFields, keyof BusinessUser | "businessPersona" | IndustrySpecificDataAddOnFields>;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldOptions?: TextFieldProps;
}

export const OnboardingField = ({
  fieldName,
  inputErrorBar,
  className,
  ...props
}: OnboardingProps): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const { Config } = useConfig();

  const onValidation = (fieldName: string, invalid: boolean): void => {
    props.onValidation && props.onValidation(fieldName as ProfileFields, invalid);
  };

  const handleChange = (value: string): void => {
    if (props.handleChange) {
      props.handleChange(value);
      return;
    }
    const profileData = { ...state.profileData } as Record<
      keyof ProfileData,
      keyof ProfileData[keyof ProfileData]
    >;
    profileData[fieldName as keyof ProfileData] = value as keyof ProfileData[keyof ProfileData];
    setProfileData({
      ...profileData,
    });
  };

  return (
    <div className={`${className} ${inputErrorBar ? "input-error-bar" : ""} ${props.error ? "error" : ""}`}>
      <GenericTextField
        value={state.profileData[fieldName] as string | undefined}
        fieldName={fieldName as string}
        {...props}
        placeholder={
          props.placeholder ?? (Config.profileDefaults[state.flow][fieldName] as any).placeholder ?? ""
        }
        validationText={
          props.validationText ??
          (Config.profileDefaults[state.flow][fieldName] as any).errorTextRequired ??
          ""
        }
        handleChange={handleChange}
        onValidation={onValidation}
      />
    </div>
  );
};
