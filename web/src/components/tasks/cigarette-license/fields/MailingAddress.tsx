import { GenericTextField } from "@/components/GenericTextField";
import { Checkbox, FormControlLabel } from "@mui/material";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { ReactElement, useContext, useEffect } from "react";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Content } from "@/components/Content";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";

interface Props {
  className?: string;
}

export const MailingAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setCigaretteLicenseData } = useContext(CigaretteLicenseContext);
  const { setIsValid: setIsLine1Valid, isFormFieldInvalid: isLine1FieldInvalid } =
    useFormContextFieldHelpers("mailingAddressLine1", DataFormErrorMapContext);
  const { setIsValid: setIsLine2Valid, isFormFieldInvalid: isLine2FieldInvalid } =
    useFormContextFieldHelpers("mailingAddressLine2", DataFormErrorMapContext);
  const { setIsValid: setIsCityValid, isFormFieldInvalid: isCityFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressCity", DataFormErrorMapContext);
  const { setIsValid: setIsStateValid, isFormFieldInvalid: isStateFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressState", DataFormErrorMapContext);
  const { setIsValid: setIsZipCodeValid, isFormFieldInvalid: isZipCodeFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressZipCode", DataFormErrorMapContext);
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  type TextFields =
    | "mailingAddressLine1"
    | "mailingAddressLine2"
    | "mailingAddressCity"
    | "mailingAddressState"
    | "mailingAddressZipCode";

  const handleChange = (val: string | StateObject | undefined, fieldName: TextFields) => {
    if (val !== undefined) {
      setCigaretteLicenseData({
        ...state,
        [fieldName]: val,
      });
    }
  };

  const handleAddressIsTheSame = () => {
    if (!state.mailingAddressIsTheSame) {
      setCigaretteLicenseData({
        ...state,
        mailingAddressIsTheSame: true,
      });
      setIsLine1Valid(true);
      setIsLine2Valid(true);
      setIsCityValid(true);
      setIsStateValid(true);
      setIsZipCodeValid(true);
    } else {
      setCigaretteLicenseData({
        ...state,
        mailingAddressIsTheSame: false,
      });
      performValidation();
    }
  };

  const getErrorMessage = (field: TextFields) => {
    if (!state[field]) return Config.cigaretteLicenseStep2.fields[field].errorRequiredText;

    if (field === "mailingAddressZipCode" && state.mailingAddressState?.shortCode === "NJ")
      return Config.cigaretteLicenseStep2.fields.mailingAddressZipCode.errorValidationTextAlt;

    return Config.cigaretteLicenseStep2.fields[field].errorValidationText;
  };

  const validateMaxLength = (val: string, required: boolean) => {
    if (required && val === "") return false;

    return val.length <= 35;
  };

  const validateZip = (zip: string) => {
    if (!zip) return false;

    const isValidUsZipCode = isZipCodeUs(zip);
    const isValidNjZipCode = isZipCodeNj(zip);

    return state.mailingAddressState?.shortCode === "NJ" ? isValidNjZipCode : isValidUsZipCode;
  };

  useEffect(() => {
    performValidation();
  }, [state]);

  const performValidation = (): void => {
    {
      /*
    TODO: if mailing address is the same as billing then autofilling mailing and lock fields
    if not the same, then enforce all of these validations
    */
    }
    setIsLine1Valid(validateMaxLength(state.mailingAddressLine1, true));
    setIsLine2Valid(validateMaxLength(state.mailingAddressLine2, false));
    setIsCityValid(state.mailingAddressCity !== "");
    setIsStateValid(state.mailingAddressState !== undefined);
    setIsZipCodeValid(validateZip(state.mailingAddressZipCode));
  };

  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            checked={state.mailingAddressIsTheSame}
            onChange={handleAddressIsTheSame}
            id="mailing-address-the-same"
          />
        }
        label={Config.cigaretteLicenseStep2.mailingIsSameCheck}
      />
      {!state.mailingAddressIsTheSame && (
        <>
          <div className="margin-y-2">
            <WithErrorBar
              className={"padding-bottom-1"}
              hasError={isLine1FieldInvalid}
              type={"ALWAYS"}
            >
              <label htmlFor="mailingAddressLine1">
                <span className={"text-bold"}>
                  <Content>{Config.cigaretteLicenseStep2.fields.mailingAddressLine1.label}</Content>
                </span>
                <GenericTextField
                  inputWidth={"full"}
                  {...props}
                  fieldName="mailingAddressLine1"
                  handleChange={(val) => handleChange(val, "mailingAddressLine1")}
                  disabled={state.mailingAddressIsTheSame}
                  formContext={DataFormErrorMapContext}
                  value={state.mailingAddressLine1}
                  error={isLine1FieldInvalid}
                  validationText={getErrorMessage("mailingAddressLine1")}
                  preventRefreshWhenUnmounted
                  onValidation={performValidation}
                />
              </label>
            </WithErrorBar>
          </div>
          <div className="margin-y-2">
            <WithErrorBar
              className={"padding-bottom-1"}
              hasError={isLine2FieldInvalid}
              type={"ALWAYS"}
            >
              <label htmlFor="mailingAddressLine2">
                <span className={"text-bold"}>
                  <Content>{Config.cigaretteLicenseStep2.fields.mailingAddressLine2.label}</Content>
                </span>
                <GenericTextField
                  inputWidth={"full"}
                  {...props}
                  fieldName="mailingAddressLine2"
                  handleChange={(val) => handleChange(val, "mailingAddressLine2")}
                  disabled={state.mailingAddressIsTheSame}
                  formContext={DataFormErrorMapContext}
                  value={state.mailingAddressLine2}
                  error={isLine2FieldInvalid}
                  validationText={getErrorMessage("mailingAddressLine2")}
                  preventRefreshWhenUnmounted
                  onValidation={performValidation}
                />
              </label>
            </WithErrorBar>
          </div>
          <div className={"grid-row grid-gap"}>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              <WithErrorBar
                className={"padding-bottom-1"}
                hasError={isCityFieldInvalid}
                type={"ALWAYS"}
              >
                <label htmlFor="mailingAddressCity">
                  <span className={"text-bold"}>
                    <Content>
                      {Config.cigaretteLicenseStep2.fields.mailingAddressCity.label}
                    </Content>
                  </span>
                  <GenericTextField
                    inputWidth={"full"}
                    {...props}
                    fieldName="mailingAddressCity"
                    handleChange={(val) => handleChange(val, "mailingAddressCity")}
                    disabled={state.mailingAddressIsTheSame}
                    formContext={DataFormErrorMapContext}
                    value={state.mailingAddressCity}
                    error={isCityFieldInvalid}
                    validationText={getErrorMessage("mailingAddressCity")}
                    preventRefreshWhenUnmounted
                    onValidation={performValidation}
                  />
                </label>
              </WithErrorBar>
            </span>
            <span className={`${isMobile ? "grid-col-6" : "grid-col-3"}`}>
              <label htmlFor="mailingAddressState">
                <span className={"text-bold"}>
                  <Content>{Config.cigaretteLicenseStep2.fields.mailingAddressState.label}</Content>
                </span>
                <StateDropdown
                  fieldName="mailingAddressState"
                  onSelect={(val) => handleChange(val, "mailingAddressState")}
                  disabled={state.mailingAddressIsTheSame}
                  value={state.mailingAddressState?.shortCode}
                  error={isStateFieldInvalid}
                  validationText={getErrorMessage("mailingAddressState")}
                  onValidation={performValidation}
                />
              </label>
            </span>
            <span className={`${isMobile ? "grid-col-6" : "grid-col-3"}`}>
              <label htmlFor="mailingAddressZipCode">
                <span className={"text-bold"}>
                  <Content>
                    {Config.cigaretteLicenseStep2.fields.mailingAddressZipCode.label}
                  </Content>
                </span>
                <GenericTextField
                  inputWidth={"full"}
                  {...props}
                  fieldName="mailingAddressZipCode"
                  handleChange={(val) => handleChange(val, "mailingAddressZipCode")}
                  disabled={state.mailingAddressIsTheSame}
                  formContext={DataFormErrorMapContext}
                  numericProps={{ maxLength: 5 }}
                  value={state.mailingAddressZipCode}
                  error={isZipCodeFieldInvalid}
                  validationText={getErrorMessage("mailingAddressZipCode")}
                  preventRefreshWhenUnmounted
                  onValidation={performValidation}
                />
              </label>
            </span>
          </div>
        </>
      )}
    </div>
  );
};
