import { Content } from "@/components/Content";
import { ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import React, { ReactElement, useContext } from "react";
import { GenericTextField, GenericTextFieldProps } from "../GenericTextField";

export interface OnboardingProps extends Omit<GenericTextFieldProps, "value" | "onValidation" | "fieldName"> {
  fieldName: ProfileFields;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  headerAriaLevel?: number;
}

export const OnboardingField = ({
  fieldName,
  headerAriaLevel = 2,
  ...props
}: OnboardingProps): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const onValidation = (fieldName: string, invalid: boolean): void => {
    props.onValidation && props.onValidation(fieldName as ProfileFields, invalid);
  };

  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
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
      {state.displayContent[fieldName].contentMd && (
        <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${fieldName}`}>
          <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent[fieldName].contentMd}</Content>
        </div>
      )}
      <div className="form-input">
        <GenericTextField
          value={state.profileData[fieldName] as string | undefined}
          fieldName={fieldName as string}
          placeholder={
            (state.displayContent[fieldName] as Record<string, string | undefined>).placeholder ?? ""
          }
          {...props}
          handleChange={handleChange}
          onValidation={onValidation}
        />
      </div>
    </div>
  );
};
