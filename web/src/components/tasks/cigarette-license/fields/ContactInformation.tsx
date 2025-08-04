import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getPhoneNumberFormat, validateEmail } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const ContactInformation = (): ReactElement => {
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

  console.log(DataFormErrorMapContext);
  console.log(isContactPhoneNumberValid, isContactNameValid);
  return (
    <>
      <WithErrorBar
        hasError={isContactNameValid || isContactPhoneNumberValid}
        type="ALWAYS"
        className="margin-bottom-2"
      >
        <div className={"grid-row grid-gap"}>
          <span className="grid-col">
            <strong>
              <Content>Contact Name</Content>
            </strong>
            <GenericTextField
              fieldName="contactName"
              handleChange={(val) => handleChange(val, "contactName")}
              onValidation={(fieldName, invalid, value) => setIsContactNameValid(!invalid)}
              additionalValidationIsValid={validateEmail}
              error={isContactNameValid}
              validationText="Contact name is required"
              required={true}
              autoComplete="name"
              formContext={DataFormErrorMapContext}
              value={state.contactName}
            />
          </span>
          <span className="grid-col">
            <strong>
              <Content>Phone Number</Content>
            </strong>
            <GenericTextField
              fieldName="contactPhoneNumber"
              handleChange={(val) => handleChange(val, "contactPhoneNumber")}
              onValidation={(fieldName, invalid, value) => setIsContactPhoneNumberValid(!invalid)}
              error={isContactPhoneNumberValid}
              validationText="Valid phone number is required"
              required={true}
              autoComplete="tel"
              inputWidth="full"
              formContext={DataFormErrorMapContext}
              value={state.contactPhoneNumber}
              visualFilter={getPhoneNumberFormat}
              numericProps={{ maxLength: 10, minLength: 10 }}
            />
          </span>
        </div>
      </WithErrorBar>

      <WithErrorBar hasError={isContactEmailValid} type="ALWAYS" className="margin-bottom-2">
        <strong>
          <Content>Email Address</Content>
        </strong>
        <GenericTextField
          fieldName="contactEmail"
          // value={formData.contactEmail}
          // handleChange={(value: string) => handleFieldChange("contactEmail", value)}
          handleChange={(val) => handleChange(val, "contactEmail")}
          onValidation={(fieldName, invalid, value) => setIsContactEmailValid(!invalid)}
          additionalValidationIsValid={validateEmail}
          error={isContactEmailValid}
          validationText="Valid email address is required"
          required={true}
          autoComplete="email"
          type="email"
          inputWidth="full"
          formContext={DataFormErrorMapContext}
          value={state.contactEmail}
        />
      </WithErrorBar>
    </>
  );
};
