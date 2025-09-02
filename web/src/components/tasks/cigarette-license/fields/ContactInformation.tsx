import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getPhoneNumberFormat, validateEmail } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

interface Props {
  CMS_ONLY_show_error?: boolean;
}

export const ContactInformation = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { setIsValid: setIsContactNameValid, isFormFieldInvalid: isContactNameValid } =
    useFormContextFieldHelpers("contactName", DataFormErrorMapContext);
  const {
    setIsValid: setIsContactPhoneNumberValid,
    isFormFieldInvalid: isContactPhoneNumberValid,
  } = useFormContextFieldHelpers("contactPhoneNumber", DataFormErrorMapContext);
  const { setIsValid: setIsContactEmailValid, isFormFieldInvalid: isContactEmailValid } =
    useFormContextFieldHelpers("contactEmail", DataFormErrorMapContext);

  const { state, setCigaretteLicenseData } = useContext(CigaretteLicenseContext);

  const handleChange = (
    val: string,
    fieldName: "contactName" | "contactPhoneNumber" | "contactEmail",
  ): void => {
    if (val !== undefined) {
      setCigaretteLicenseData({
        ...state,
        [fieldName]: val,
      });
    }
  };

  return (
    <>
      <WithErrorBar
        hasError={props.CMS_ONLY_show_error || isContactNameValid || isContactPhoneNumberValid}
        type="ALWAYS"
        className="margin-bottom-2"
      >
        <div className="grid-row grid-gap-2 margin-y-2">
          <span id="question-contactName" className="grid-col-6">
            <strong>
              <Content>{Config.cigaretteLicenseStep2.fields.contactName.label}</Content>
            </strong>
            <GenericTextField
              fieldName="contactName"
              handleChange={(val) => handleChange(val, "contactName")}
              onValidation={(fieldName, invalid) => setIsContactNameValid(!invalid)}
              error={props.CMS_ONLY_show_error || isContactNameValid}
              validationText={Config.cigaretteLicenseStep2.fields.contactName.errorRequiredText}
              required={true}
              autoComplete="name"
              formContext={DataFormErrorMapContext}
              value={state.contactName}
              preventRefreshWhenUnmounted
            />
          </span>
          <span id="question-contactPhoneNumber" className="grid-col-6">
            <strong>
              <Content>{Config.cigaretteLicenseStep2.fields.contactPhoneNumber.label}</Content>
            </strong>
            <GenericTextField
              fieldName="contactPhoneNumber"
              handleChange={(val) => handleChange(val, "contactPhoneNumber")}
              onValidation={(fieldName, invalid) => setIsContactPhoneNumberValid(!invalid)}
              error={props.CMS_ONLY_show_error || isContactPhoneNumberValid}
              validationText={
                Config.cigaretteLicenseStep2.fields.contactPhoneNumber.errorRequiredText
              }
              required={true}
              autoComplete="tel"
              inputWidth="full"
              formContext={DataFormErrorMapContext}
              value={state.contactPhoneNumber}
              visualFilter={getPhoneNumberFormat}
              numericProps={{ maxLength: 10, minLength: 10 }}
              preventRefreshWhenUnmounted
            />
          </span>
        </div>
      </WithErrorBar>

      <div id="question-contactEmail">
        <WithErrorBar
          hasError={props.CMS_ONLY_show_error || isContactEmailValid}
          type="ALWAYS"
          className="margin-top-2 margin-bottom-2"
        >
          <strong>
            <Content>{Config.cigaretteLicenseStep2.fields.contactEmail.label}</Content>
          </strong>
          <GenericTextField
            fieldName="contactEmail"
            handleChange={(val) => handleChange(val, "contactEmail")}
            onValidation={(fieldName, invalid) => setIsContactEmailValid(!invalid)}
            additionalValidationIsValid={validateEmail}
            error={props.CMS_ONLY_show_error || isContactEmailValid}
            validationText={Config.cigaretteLicenseStep2.fields.contactEmail.errorRequiredText}
            required={true}
            autoComplete="email"
            type="email"
            inputWidth="full"
            formContext={DataFormErrorMapContext}
            value={state.contactEmail}
            preventRefreshWhenUnmounted
          />
        </WithErrorBar>
      </div>
    </>
  );
};
