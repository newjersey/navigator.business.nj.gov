/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { BusinessUser, ProfileData } from "@businessnjgovnavigator/shared/";
import { TextFieldProps } from "@mui/material";
import { ReactElement, useContext } from "react";

export interface OnboardingProps extends Omit<GenericTextFieldProps, "value" | "onValidation" | "fieldName"> {
  fieldName: Exclude<ProfileFields, keyof BusinessUser | "businessPersona">;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  headerAriaLevel?: number;
  showHeader?: boolean;
  fieldOptions?: TextFieldProps;
}

export const OnboardingField = ({
  fieldName,
  headerAriaLevel = 2,
  showHeader = true,
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

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <div>
      {showHeader && (
        <Content overrides={{ h2: headerLevelTwo }}>
          {Config.profileDefaults[state.flow][fieldName].header}
        </Content>
      )}
      {Object.keys(Config.profileDefaults[state.flow][fieldName]).includes("description") && (
        <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${fieldName}`}>
          <Content>{(Config.profileDefaults[state.flow][fieldName] as any).description}</Content>
        </div>
      )}
      <GenericTextField
        value={state.profileData[fieldName] as string | undefined}
        fieldName={fieldName as string}
        placeholder={(Config.profileDefaults[state.flow][fieldName] as any).placeholder ?? ""}
        {...props}
        handleChange={handleChange}
        onValidation={onValidation}
      />
    </div>
  );
};
