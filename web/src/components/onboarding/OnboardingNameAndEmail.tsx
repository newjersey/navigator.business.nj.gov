import { GenericTextField } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import {
  FullNameErrorVariant,
  getFullNameErrorVariant,
  isFullNameValid,
} from "@/lib/domain-logic/isFullNameValid";
import { FormContextFieldProps } from "@/lib/types/types";
import { validateEmail } from "@/lib/utils/helpers";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

export const OnboardingNameAndEmail = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { state, setUser } = useContext(ProfileDataContext);
  const [email, setEmail] = useState<string>(state.user?.email || "");
  const [confirmEmail, setConfirmEmail] = useState<string | undefined>(state.user?.email || undefined);
  const { Config } = useConfig();

  const { Validate, isFormFieldInValid, RegisterForOnSubmit } = useFormContextFieldHelpers(
    "email",
    profileFormContext,
    props.errorTypes
  );

  RegisterForOnSubmit(() => (state.user?.email ? validateEmail(state.user.email) : false));

  const FullNameErrorMessageLookup: Record<FullNameErrorVariant, string> = {
    MISSING: Config.selfRegistration.errorTextFullName,
    TOO_LONG: Config.selfRegistration.errorTextFullNameLength,
    MUST_START_WITH_LETTER: Config.selfRegistration.errorTextFullNameStartWithLetter,
    CONTAINS_ILLEGAL_CHAR: Config.selfRegistration.errorTextFullNameSpecialCharacter,
    NO_ERROR: "",
  };

  const updateEmailState = (value: string): void => {
    state.user && setUser({ ...state.user, email: value });
  };

  const handleUserTesting = (value: boolean): void => {
    state.user && setUser({ ...state.user, userTesting: value });
  };

  const handleNewsletter = (value: boolean): void => {
    state.user && setUser({ ...state.user, receiveNewsletter: value });
  };

  const handleName = (value: string): void => {
    state.user && setUser({ ...state.user, name: value });
  };

  const handleEmail = (confirm = false) => {
    return (value: string) => {
      if (confirm) {
        setConfirmEmail(value);
        email === value && email.length > 0 ? updateEmailState(email) : updateEmailState("");
      } else {
        setEmail(value);
        confirmEmail === value && value.length > 0 ? updateEmailState(value) : updateEmailState("");
      }
    };
  };

  return (
    <div className="tablet:padding-y-2">
      <p className="padding-bottom-1">{Config.selfRegistration.signUpDescriptionText}</p>
      <div className="margin-top-2">
        <label htmlFor="name">{Config.selfRegistration.nameFieldLabel}</label>
        <GenericTextField
          value={state.user?.name}
          formContext={profileFormContext}
          fieldName={"name"}
          validationText={FullNameErrorMessageLookup[getFullNameErrorVariant(state.user?.name)]}
          required={true}
          handleChange={handleName}
          additionalValidationIsValid={isFullNameValid}
          inputWidth="default"
        />
      </div>
      <div className="margin-top-2">
        <label htmlFor="email">{Config.selfRegistration.emailFieldLabel}</label>
        <GenericTextField
          value={email}
          fieldName={"email"}
          error={isFormFieldInValid}
          handleChange={handleEmail()}
          onValidation={(_, invalid): void => Validate(invalid)}
          validationText={Config.selfRegistration.errorTextEmailsNotMatching}
          required={true}
          additionalValidationIsValid={(value): boolean => {
            return confirmEmail ? value === confirmEmail : true && validateEmail(value);
          }}
          inputWidth="default"
        />
      </div>
      <div className="margin-y-2">
        <label htmlFor="confirm-email">{Config.selfRegistration.confirmEmailFieldLabel}</label>
        <GenericTextField
          value={confirmEmail}
          error={isFormFieldInValid}
          handleChange={handleEmail(true)}
          onValidation={(_, invalid): void => Validate(invalid)}
          required={true}
          additionalValidationIsValid={(value): boolean => {
            return value === email && validateEmail(value);
          }}
          validationText={Config.selfRegistration.errorTextEmailsNotMatching}
          fieldName={"confirm-email"}
          inputWidth="default"
        />
      </div>
      <FormGroup>
        <FormControlLabel
          label={Config.selfRegistration.newsletterCheckboxLabel}
          control={
            <Checkbox
              checked={state.user?.receiveNewsletter}
              onChange={(event): void => handleNewsletter(event.target.checked)}
              id="newsletterCheckbox"
            />
          }
        />
        <FormControlLabel
          label={Config.selfRegistration.userTestingCheckboxLabel}
          control={
            <Checkbox
              checked={state.user?.userTesting}
              onChange={(event): void => handleUserTesting(event.target.checked)}
              id="contactMeCheckbox"
            />
          }
        />
      </FormGroup>
    </div>
  );
};
