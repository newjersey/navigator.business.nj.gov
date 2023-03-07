import { GenericTextField } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  FullNameErrorVariant,
  getFullNameErrorVariant,
  isFullNameValid,
} from "@/lib/domain-logic/isFullNameValid";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { validateEmail } from "@/lib/utils/helpers";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

interface Props {
  onValidation: (fieldName: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingNameAndEmail = (props: Props): ReactElement => {
  const { state, setUser } = useContext(ProfileDataContext);
  const [email, setEmail] = useState<string>(state.user?.email || "");
  const [confirmEmail, setConfirmEmail] = useState<string | undefined>(state.user?.email || undefined);
  const { Config } = useConfig();

  const FullNameErrorMessageLookup: Record<FullNameErrorVariant, string> = {
    MISSING: Config.selfRegistration.errorTextFullName,
    TOO_LONG: Config.selfRegistration.errorTextFullNameLength,
    MUST_START_WITH_LETTER: Config.selfRegistration.errorTextFullNameStartWithLetter,
    CONTAINS_ILLEGAL_CHAR: Config.selfRegistration.errorTextFullNameSpecialCharacter,
    NO_ERROR: "",
  };

  const updateEmailState = (value: string) => {
    state.user && setUser({ ...state.user, email: value });
  };

  const handleUserTesting = (value: boolean) => {
    state.user && setUser({ ...state.user, userTesting: value });
  };

  const handleNewsletter = (value: boolean) => {
    state.user && setUser({ ...state.user, receiveNewsletter: value });
  };

  const handleName = (value: string) => {
    state.user && setUser({ ...state.user, name: value });
  };

  const handleEmail = (confirm = false) => {
    return (value: string) => {
      if (confirm) {
        setConfirmEmail(value);
        email == value && email.length > 0 ? updateEmailState(email) : updateEmailState("");
      } else {
        setEmail(value);
        confirmEmail == value && value.length > 0 ? updateEmailState(value) : updateEmailState("");
      }
    };
  };

  const onValidation = (fieldName: string, invalid: boolean): void => {
    return props.onValidation(fieldName as ProfileFields, invalid);
  };

  return (
    <div className="tablet:padding-y-2">
      <p className="padding-bottom-1">{Config.selfRegistration.signUpDescriptionText}</p>
      <div className="margin-top-2">
        <label htmlFor="name">{Config.selfRegistration.nameFieldLabel}</label>
        <GenericTextField
          value={state.user?.name}
          fieldName={"name"}
          error={props.fieldStates["name"].invalid}
          onValidation={onValidation}
          validationText={FullNameErrorMessageLookup[getFullNameErrorVariant(state.user?.name)]}
          required={true}
          handleChange={handleName}
          additionalValidation={isFullNameValid}
        />
      </div>
      <div className="margin-top-2">
        <label htmlFor="email">{Config.selfRegistration.emailFieldLabel}</label>
        <GenericTextField
          value={email}
          fieldName={"email"}
          error={props.fieldStates["email"].invalid}
          handleChange={handleEmail()}
          onValidation={onValidation}
          validationText={Config.selfRegistration.errorTextEmailsNotMatching}
          required={true}
          additionalValidation={(value) => {
            return confirmEmail ? value == confirmEmail : true && validateEmail(value);
          }}
        />
      </div>
      <div className="margin-y-2">
        <label htmlFor="confirm-email">{Config.selfRegistration.confirmEmailFieldLabel}</label>
        <GenericTextField
          value={confirmEmail}
          error={props.fieldStates["email"].invalid}
          handleChange={handleEmail(true)}
          onValidation={(_, invalid) => {
            return onValidation("email", invalid);
          }}
          required={true}
          additionalValidation={(value) => {
            return value == email && validateEmail(value);
          }}
          validationText={Config.selfRegistration.errorTextEmailsNotMatching}
          fieldName={"confirm-email"}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          label={<div className="padding-y-1">{Config.selfRegistration.newsletterCheckboxLabel}</div>}
          control={
            <Checkbox
              checked={state.user?.receiveNewsletter}
              onChange={(event) => {
                return handleNewsletter(event.target.checked);
              }}
              id="newsletterCheckbox"
            />
          }
        />
        <FormControlLabel
          label={<div className="padding-y-1">{Config.selfRegistration.userTestingCheckboxLabel}</div>}
          control={
            <Checkbox
              checked={state.user?.userTesting}
              onChange={(event) => {
                return handleUserTesting(event.target.checked);
              }}
              id="contactMeCheckbox"
            />
          }
        />
      </FormGroup>
    </div>
  );
};
