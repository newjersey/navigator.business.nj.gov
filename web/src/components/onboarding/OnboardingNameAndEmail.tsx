import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";
import { GenericTextField } from "../GenericTextField";

interface Props {
  onValidation: (fieldName: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
}

export const OnboardingNameAndEmail = (props: Props): ReactElement => {
  const { state, setUser } = useContext(ProfileDataContext);
  const [email, setEmail] = useState<string>(state.user?.email || "");
  const [confirmEmail, setConfirmEmail] = useState<string | undefined>(state.user?.email || undefined);

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

  const handleEmail =
    (confirm = false) =>
    (value: string) => {
      if (confirm) {
        setConfirmEmail(value);
        email == value && email.length > 0 ? updateEmailState(email) : updateEmailState("");
      } else {
        setEmail(value);
        confirmEmail == value && value.length > 0 ? updateEmailState(value) : updateEmailState("");
      }
    };

  const onValidation = (fieldName: string, invalid: boolean): void =>
    props.onValidation(fieldName as ProfileFields, invalid);

  return (
    <div className="tablet:padding-2">
      <p className="padding-bottom-1">{Config.selfRegistration.signupDescriptionText}</p>
      <div className="margin-top-2">
        <label htmlFor="name">{Config.selfRegistration.nameFieldLabel}</label>
        <GenericTextField
          value={state.user?.name}
          fieldName={"name"}
          error={props.fieldStates["name"].invalid}
          onValidation={onValidation}
          validationText={Config.selfRegistration.errorTextRequiredFields}
          required={true}
          placeholder={Config.selfRegistration.nameFieldPlaceholder}
          handleChange={handleName}
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
          additionalValidation={(value) => (confirmEmail ? value == confirmEmail : true)}
          placeholder={Config.selfRegistration.emailFieldPlaceholder}
        />
      </div>
      <div className="margin-y-2">
        <label htmlFor="confirm-email">{Config.selfRegistration.confirmEmailFieldLabel}</label>
        <GenericTextField
          value={confirmEmail}
          error={props.fieldStates["email"].invalid}
          handleChange={handleEmail(true)}
          onValidation={(_, invalid) => onValidation("email", invalid)}
          required={true}
          additionalValidation={(value) => value == email}
          validationText={Config.selfRegistration.errorTextEmailsNotMatching}
          placeholder={Config.selfRegistration.confirmEmailFieldPlaceholder}
          fieldName={"confirm-email"}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          style={{ display: "table" }}
          label={Config.selfRegistration.newsletterCheckboxLabel}
          control={
            <div style={{ display: "table-cell", width: "42px" }}>
              <Checkbox
                checked={state.user?.receiveNewsletter}
                onChange={(event) => handleNewsletter(event.target.checked)}
              />
            </div>
          }
        />
        <FormControlLabel
          style={{ display: "table" }}
          label={Config.selfRegistration.userTestingCheckboxLabel}
          control={
            <div style={{ display: "table-cell", width: "42px" }}>
              <Checkbox
                checked={state.user?.userTesting}
                onChange={(event) => handleUserTesting(event.target.checked)}
              />
            </div>
          }
        />
      </FormGroup>
    </div>
  );
};
