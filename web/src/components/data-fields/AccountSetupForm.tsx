import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import {
  FullNameErrorVariant,
  getFullNameErrorVariant,
  isFullNameValid,
} from "@/lib/domain-logic/isFullNameValid";
import {
  getPhoneNumberFormat,
  validateEmail,
  validateOptionalPhoneNumber,
} from "@/lib/utils/helpers";
import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

interface Props extends FormContextFieldProps {
  user: BusinessUser;
  setUser: (user: BusinessUser) => void;
}

export const AccountSetupForm = (props: Props): ReactElement => {
  const [email, setEmail] = useState<string>(props.user.email || "");
  const [confirmEmail, setConfirmEmail] = useState<string | undefined>(
    props.user.email || undefined,
  );
  const { Config } = useConfig();
  const { registrationStatus, setRegistrationStatus } = useContext(NeedsAccountContext);

  const emailFormContextHelpers = useFormContextFieldHelpers(
    "email",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  const nameFormContextHelpers = useFormContextFieldHelpers(
    "name",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  const phoneNumberFormContextHelpers = useFormContextFieldHelpers(
    "phoneNumber",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  emailFormContextHelpers.RegisterForOnSubmit(() =>
    props.user.email ? validateEmail(props.user.email) : false,
  );
  nameFormContextHelpers.RegisterForOnSubmit(
    () => getFullNameErrorVariant(props.user.name) === "NO_ERROR",
  );
  phoneNumberFormContextHelpers.RegisterForOnSubmit(() =>
    validateOptionalPhoneNumber(props.user.phoneNumber || ""),
  );

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

  const handleContactSharingWithAccountCreationPartner = (value: boolean): void => {
    props.setUser({ ...props.user, contactSharingWithAccountCreationPartner: value });
  };

  const handleName = (value: string): void => {
    props.setUser({ ...props.user, name: value });
  };

  const handleUpdatesAndReminders = (value: boolean): void => {
    props.setUser({ ...props.user, receiveUpdatesAndReminders: value });
  };

  const handlePhoneNumber = (value: string): void => {
    props.setUser({ ...props.user, phoneNumber: value });
  };

  const handleEmail = (confirm = false) => {
    return (value: string): void => {
      if (confirm) {
        setConfirmEmail(value);
        email === value && email.length > 0 ? updateEmailState(email) : updateEmailState("");
      } else {
        setEmail(value);
        confirmEmail === value && value.length > 0 ? updateEmailState(value) : updateEmailState("");
      }
    };
  };

  const getEmailError = (): boolean => {
    return emailFormContextHelpers.isFormFieldInvalid || registrationStatus === "DUPLICATE_ERROR";
  };

  const getEmailValidationText = (emailInput: { isConfirmEmail: boolean }): string => {
    if (registrationStatus === "DUPLICATE_ERROR") {
      if (emailInput.isConfirmEmail) {
        return Config.selfRegistration.errorTextDuplicateSignUp;
      }
      return "";
    }
    return Config.selfRegistration.errorTextEmailsNotMatching;
  };

  const resetRegistrationErrorOnFocus = (): void => {
    if (registrationStatus === "DUPLICATE_ERROR") {
      setRegistrationStatus(undefined);
    }
  };

  return (
    <div className="tablet:padding-y-2">
      <div className="margin-top-2">
        <WithErrorBar hasError={nameFormContextHelpers.isFormFieldInvalid} type="ALWAYS">
          <label htmlFor="name" className="text-bold">
            {Config.selfRegistration.nameFieldLabel}
          </label>
          <GenericTextField
            value={props.user.name}
            formContext={DataFormErrorMapContext}
            fieldName={"name"}
            error={nameFormContextHelpers.isFormFieldInvalid}
            validationText={FullNameErrorMessageLookup[getFullNameErrorVariant(props.user.name)]}
            required={true}
            handleChange={handleName}
            additionalValidationIsValid={isFullNameValid}
            inputWidth="default"
            onFocus={resetRegistrationErrorOnFocus}
          />
        </WithErrorBar>
      </div>
      <WithErrorBar hasError={registrationStatus === "DUPLICATE_ERROR"} type="ALWAYS">
        <div className="margin-top-2">
          <WithErrorBar hasError={getEmailError()} type="ALWAYS">
            <label htmlFor="email" className="text-bold">
              {Config.selfRegistration.emailFieldLabel}
            </label>
            <GenericTextField
              value={email}
              fieldName={"email"}
              error={getEmailError()}
              handleChange={handleEmail()}
              onValidation={(_, invalid): void => emailFormContextHelpers.setIsValid(!invalid)}
              validationText={getEmailValidationText({ isConfirmEmail: false })}
              required={true}
              additionalValidationIsValid={(value): boolean => {
                return confirmEmail ? value === confirmEmail : validateEmail(value);
              }}
              inputWidth="default"
              onFocus={resetRegistrationErrorOnFocus}
            />
          </WithErrorBar>
        </div>
        <div className="margin-y-2">
          <WithErrorBar hasError={getEmailError()} type="ALWAYS">
            <label htmlFor="confirm-email" className="text-bold">
              {Config.selfRegistration.confirmEmailFieldLabel}
            </label>
            <GenericTextField
              value={confirmEmail}
              error={getEmailError()}
              handleChange={handleEmail(true)}
              onValidation={(_, invalid): void => emailFormContextHelpers.setIsValid(!invalid)}
              required={true}
              additionalValidationIsValid={(value): boolean => {
                return value === email && validateEmail(value);
              }}
              validationText={getEmailValidationText({ isConfirmEmail: true })}
              fieldName={"confirm-email"}
              inputWidth="default"
            />
          </WithErrorBar>
        </div>
      </WithErrorBar>
      <WithErrorBar hasError={phoneNumberFormContextHelpers.isFormFieldInvalid} type="ALWAYS">
        <div className="margin-top-2">
          <label htmlFor="phoneNumber" className="text-bold">
            {Config.selfRegistration.phoneNumberFieldLabel}
          </label>
          {Config.selfRegistration.phoneNumberFieldLabelOptional && (
            <span className="margin-left-1">
              {Config.selfRegistration.phoneNumberFieldLabelOptional}
            </span>
          )}
          <GenericTextField
            value={props.user.phoneNumber || ""}
            fieldName={"phoneNumber"}
            formContext={DataFormErrorMapContext}
            error={phoneNumberFormContextHelpers.isFormFieldInvalid}
            handleChange={handlePhoneNumber}
            onValidation={(_, invalid): void => phoneNumberFormContextHelpers.setIsValid(!invalid)}
            validationText={
              phoneNumberFormContextHelpers.isFormFieldInvalid
                ? Config.selfRegistration.errorTextPhoneNumber
                : ""
            }
            required={false}
            inputWidth="default"
            visualFilter={getPhoneNumberFormat}
            numericProps={{ maxLength: 10, minLength: 0 }}
            additionalValidationIsValid={validateOptionalPhoneNumber}
            autoComplete="tel"
          />
        </div>
      </WithErrorBar>
      <div className="margin-top-3">
        <FormGroup>
          <FormControlLabel
            label={Config.selfRegistration.updatesAndRemindersCheckboxLabel}
            control={
              <Checkbox
                checked={props.user.receiveUpdatesAndReminders}
                onChange={(event): void => handleUpdatesAndReminders(event.target.checked)}
                id="updatesAndRemindersCheckbox"
              />
            }
          />
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

          {props.user.accountCreationSource === "investNewark" && (
            <FormControlLabel
              label={Config.selfRegistration.investNewarkContactSharingCheckboxLabel}
              control={
                <Checkbox
                  checked={props.user.contactSharingWithAccountCreationPartner}
                  onChange={(event): void =>
                    handleContactSharingWithAccountCreationPartner(event.target.checked)
                  }
                  id="investNewarkCheckbox"
                />
              }
            />
          )}
        </FormGroup>
      </div>
    </div>
  );
};
