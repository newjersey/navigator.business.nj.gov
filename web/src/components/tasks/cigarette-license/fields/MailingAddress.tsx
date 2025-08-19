import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { isZipCodeNj } from "@/lib/domain-logic/isZipCodeNj";
import { isZipCodeUs } from "@/lib/domain-logic/isZipCodeUs";
import { MediaQueries } from "@/lib/PageSizes";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { Checkbox, FormControlLabel, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

const MAX_CHAR_ADDRESS_FIELD = 35;

interface Props {
  className?: string;
  CMS_ONLY_show_error?: boolean;
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

  const handleChange = (val: string | StateObject | undefined, fieldName: TextFields): void => {
    if (val !== undefined) {
      setCigaretteLicenseData({
        ...state,
        [fieldName]: val,
      });
      performValidation();
    }
  };

  const handleAddressIsTheSame = (): void => {
    if (state.mailingAddressIsTheSame) {
      setCigaretteLicenseData({
        ...state,
        mailingAddressIsTheSame: false,
      });
    } else {
      setCigaretteLicenseData({
        ...state,
        mailingAddressIsTheSame: true,
      });
      setIsLine1Valid(true);
      setIsLine2Valid(true);
      setIsCityValid(true);
      setIsStateValid(true);
      setIsZipCodeValid(true);
    }
  };

  const getErrorMessage = (field: TextFields): string => {
    const fieldConfig = Config.cigaretteLicenseStep2.fields[field];

    if (field === "mailingAddressLine2" && props.CMS_ONLY_show_error) {
      return Config.cigaretteLicenseStep2.fields.mailingAddressLine2.errorValidationText;
    }

    if (!state[field])
      return (fieldConfig as { errorRequiredText?: string }).errorRequiredText || "";

    if (field === "mailingAddressZipCode" && state.mailingAddressState?.shortCode === "NJ")
      return Config.cigaretteLicenseStep2.fields.mailingAddressZipCode.errorValidationTextAlt;

    return (fieldConfig as { errorValidationText?: string }).errorValidationText || "";
  };

  const validateLine1AndLine2 = (val: string, required: boolean): boolean => {
    if (required && val === "") return false;

    return val.length <= MAX_CHAR_ADDRESS_FIELD;
  };

  const validateZip = (zip: string): boolean => {
    if (!zip) return false;

    const isValidUsZipCode = isZipCodeUs(zip);
    const isValidNjZipCode = isZipCodeNj(zip);

    return state.mailingAddressState?.shortCode === "NJ" ? isValidNjZipCode : isValidUsZipCode;
  };

  const performValidation = (): void => {
    setIsLine1Valid(validateLine1AndLine2(state.mailingAddressLine1 || "", true));
    setIsLine2Valid(validateLine1AndLine2(state.mailingAddressLine2 || "", false));
    setIsCityValid(state.mailingAddressCity !== "");
    setIsStateValid(state.mailingAddressState !== undefined);
    setIsZipCodeValid(validateZip(state.mailingAddressZipCode || ""));
  };

  return (
    <div className="margin-y-2">
      <FormControlLabel
        control={
          <Checkbox
            checked={state.mailingAddressIsTheSame}
            onChange={handleAddressIsTheSame}
            id="mailing-address-the-same"
          />
        }
        label={Config.cigaretteLicenseStep2.mailingIsSameCheckbox}
      />
      {!state.mailingAddressIsTheSame && (
        <>
          <div id="question-mailingAddressLine1" className="margin-y-2">
            <WithErrorBar
              className={"padding-bottom-1"}
              hasError={props.CMS_ONLY_show_error || isLine1FieldInvalid}
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
                  error={props.CMS_ONLY_show_error || isLine1FieldInvalid}
                  validationText={getErrorMessage("mailingAddressLine1")}
                  preventRefreshWhenUnmounted
                  onValidation={performValidation}
                />
              </label>
            </WithErrorBar>
          </div>
          <div id="question-mailingAddressLine2" className="margin-y-2">
            <WithErrorBar
              className={"padding-bottom-1"}
              hasError={props.CMS_ONLY_show_error || isLine2FieldInvalid}
              type={"ALWAYS"}
            >
              <label htmlFor="mailingAddressLine2">
                <Content>{Config.cigaretteLicenseStep2.fields.mailingAddressLine2.label}</Content>
                <GenericTextField
                  inputWidth={"full"}
                  {...props}
                  fieldName="mailingAddressLine2"
                  handleChange={(val) => handleChange(val, "mailingAddressLine2")}
                  disabled={state.mailingAddressIsTheSame}
                  formContext={DataFormErrorMapContext}
                  value={state.mailingAddressLine2}
                  error={props.CMS_ONLY_show_error || isLine2FieldInvalid}
                  validationText={getErrorMessage("mailingAddressLine2")}
                  preventRefreshWhenUnmounted
                  onValidation={performValidation}
                />
              </label>
            </WithErrorBar>
          </div>
          <WithErrorBar
            className={"padding-bottom-1"}
            hasError={
              props.CMS_ONLY_show_error ||
              isCityFieldInvalid ||
              isStateFieldInvalid ||
              isZipCodeFieldInvalid
            }
            type={"DESKTOP-ONLY"}
          >
            <div className="grid-row grid-gap-2 margin-top-2">
              <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
                <WithErrorBar
                  className={"padding-bottom-1"}
                  hasError={props.CMS_ONLY_show_error || isCityFieldInvalid}
                  type={"MOBILE-ONLY"}
                >
                  <label id="question-mailingAddressCity" htmlFor="mailingAddressCity">
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
                      error={props.CMS_ONLY_show_error || isCityFieldInvalid}
                      validationText={getErrorMessage("mailingAddressCity")}
                      preventRefreshWhenUnmounted
                      onValidation={performValidation}
                    />
                  </label>
                </WithErrorBar>
              </span>
              <span className={`${isMobile ? "grid-col-6" : "grid-col-3"}`}>
                <WithErrorBar
                  className={"padding-bottom-1"}
                  hasError={
                    props.CMS_ONLY_show_error || isStateFieldInvalid || isZipCodeFieldInvalid
                  }
                  type={"MOBILE-ONLY"}
                >
                  <label id="question-mailingAddressState" htmlFor="mailingAddressState">
                    <span className={"text-bold"}>
                      <Content>
                        {Config.cigaretteLicenseStep2.fields.mailingAddressState.label}
                      </Content>
                    </span>
                    <StateDropdown
                      fieldName="mailingAddressState"
                      onSelect={(val) => handleChange(val, "mailingAddressState")}
                      disabled={state.mailingAddressIsTheSame}
                      value={state.mailingAddressState?.shortCode}
                      error={props.CMS_ONLY_show_error || isStateFieldInvalid}
                      validationText={getErrorMessage("mailingAddressState")}
                      onValidation={performValidation}
                    />
                  </label>
                </WithErrorBar>
              </span>

              <span className={`${isMobile ? "grid-col-6" : "grid-col-3"}`}>
                <label id="question-mailingAddressZipCode" htmlFor="mailingAddressZipCode">
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
                    error={props.CMS_ONLY_show_error || isZipCodeFieldInvalid}
                    validationText={getErrorMessage("mailingAddressZipCode")}
                    preventRefreshWhenUnmounted
                    onValidation={performValidation}
                    data-testid="mailing-address-zip-code"
                  />
                </label>
              </span>
            </div>
          </WithErrorBar>
        </>
      )}
    </div>
  );
};
