import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
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
import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props extends FormContextFieldProps {
  user: BusinessUser;
  setUser: (user: BusinessUser) => void;
}

export const OnboardingNameAndEmail = (props: Props): ReactElement => {
  const [email, setEmail] = useState<string>(props.user.email || "");
  const [confirmEmail, setConfirmEmail] = useState<string | undefined>(props.user.email || undefined);
  const { Config } = useConfig();

  const emailFormContextHelpers = useFormContextFieldHelpers("email", profileFormContext, props.errorTypes);

  const nameFormContextHelpers = useFormContextFieldHelpers("name", profileFormContext, props.errorTypes);

  emailFormContextHelpers.RegisterForOnSubmit(() =>
    props.user.email ? validateEmail(props.user.email) : false,
  );
  nameFormContextHelpers.RegisterForOnSubmit(() => getFullNameErrorVariant(props.user.name) === "NO_ERROR");

  const FullNameErrorMessageLookup: Record<FullNameErrorVariant, string> = {
    MISSING: Config.selfRegistration.errorTextFullName,
    TOO_LONG: Config.selfRegistration.errorTextFullNameLength,
    MUST_START_WITH_LETTER: Config.selfRegistration.errorTextFullNameStartWithLetter,
    CONTAINS_ILLEGAL_CHAR: Config.selfRegistration.errorTextFullNameSpecialCharacter,
    NO_ERROR: "",
  };

  const updateEmailState = (value: string): void => {
    props.setUser({ ...props.user, email: value });
  };

  const handleUserTesting = (value: boolean): void => {
    props.setUser({ ...props.user, userTesting: value });
  };

  const handleNewsletter = (value: boolean): void => {
    props.setUser({ ...props.user, receiveNewsletter: value });
  };

  const handleName = (value: string): void => {
    props.setUser({ ...props.user, name: value });
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
        <WithErrorBar hasError={nameFormContextHelpers.isFormFieldInValid} type="ALWAYS">
          <label htmlFor="name" className="text-bold">
            {Config.selfRegistration.nameFieldLabel}
          </label>
          <GenericTextField
            value={props.user.name}
            formContext={profileFormContext}
            fieldName={"name"}
            error={nameFormContextHelpers.isFormFieldInValid}
            validationText={FullNameErrorMessageLookup[getFullNameErrorVariant(props.user.name)]}
            required={true}
            handleChange={handleName}
            additionalValidationIsValid={isFullNameValid}
            inputWidth="default"
          />
        </WithErrorBar>
      </div>
      <div className="margin-top-2">
        <WithErrorBar hasError={emailFormContextHelpers.isFormFieldInValid} type="ALWAYS">
          <label htmlFor="email" className="text-bold">
            {Config.selfRegistration.emailFieldLabel}
          </label>
          <GenericTextField
            value={email}
            fieldName={"email"}
            error={emailFormContextHelpers.isFormFieldInValid}
            handleChange={handleEmail()}
            onValidation={(_, invalid): void => emailFormContextHelpers.Validate(invalid)}
            validationText={Config.selfRegistration.errorTextEmailsNotMatching}
            required={true}
            additionalValidationIsValid={(value): boolean => {
              return confirmEmail ? value === confirmEmail : true && validateEmail(value);
            }}
            inputWidth="default"
          />
        </WithErrorBar>
      </div>
      <div className="margin-y-2">
        <WithErrorBar hasError={emailFormContextHelpers.isFormFieldInValid} type="ALWAYS">
          <label htmlFor="confirm-email" className="text-bold">
            {Config.selfRegistration.confirmEmailFieldLabel}
          </label>
          <GenericTextField
            value={confirmEmail}
            error={emailFormContextHelpers.isFormFieldInValid}
            handleChange={handleEmail(true)}
            onValidation={(_, invalid): void => emailFormContextHelpers.Validate(invalid)}
            required={true}
            additionalValidationIsValid={(value): boolean => {
              return value === email && validateEmail(value);
            }}
            validationText={Config.selfRegistration.errorTextEmailsNotMatching}
            fieldName={"confirm-email"}
            inputWidth="default"
          />
        </WithErrorBar>
      </div>
      <FormGroup>
        <FormControlLabel
          label={Config.selfRegistration.newsletterCheckboxLabel}
          control={
            <Checkbox
              checked={props.user.receiveNewsletter}
              onChange={(event): void => handleNewsletter(event.target.checked)}
              id="newsletterCheckbox"
            />
          }
        />
        <FormControlLabel
          label={Config.selfRegistration.userTestingCheckboxLabel}
          control={
            <Checkbox
              checked={props.user.userTesting}
              onChange={(event): void => handleUserTesting(event.target.checked)}
              id="contactMeCheckbox"
            />
          }
        />
      </FormGroup>
    </div>
  );
};
