import { GenericTextField } from "@/components/GenericTextField";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { ReactElement, useContext } from "react";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { Content } from "@/components/Content";

interface Props {
  className?: string;
}

export const MailingAddressState = (props: Props): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const { state, setCigaretteLicenseData } = useContext(CigaretteLicenseContext);
  const { setIsValid: setIsCityValid, isFormFieldInvalid: isCityFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressCity", DataFormErrorMapContext);
  const { setIsValid: setIsStateValid, isFormFieldInvalid: isStateFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressState", DataFormErrorMapContext);
  const { setIsValid: setIsZipCodeValid, isFormFieldInvalid: isZipCodeFieldInvalid } =
    useFormContextFieldHelpers("mailingAddressZipCode", DataFormErrorMapContext);

  const handleChangeCity = (val: string) => {
    if (val) {
      setCigaretteLicenseData({
        ...state,
        mailingAddressCity: val,
      });
      performValidation("mailingAddressCity");
    }
  };

  const handleChangeState = (val?: StateObject) => {
    if (val) {
      setCigaretteLicenseData({
        ...state,
        mailingAddressState: val,
      });
      performValidation("mailingAddressState");
    }
  };

  const handleChangeZipCode = (val: string) => {
    if (val) {
      setCigaretteLicenseData({
        ...state,
        mailingAddressZipCode: val,
      });
      performValidation("mailingAddressZipCode");
    }
  };

  const validateZip = () => {
    return state.mailingAddressZipCode !== "";
  };

  const performValidation = (
    field: "mailingAddressCity" | "mailingAddressState" | "mailingAddressZipCode",
  ): void => {
    {
      /*
    TODO: if mailing address is the same as billing then autofilling mailing and lock fields
    if not the same, then enforce all of these validations
    */
    }
    setIsCityValid(state.mailingAddressCity !== "");
    setIsStateValid(state.mailingAddressState !== undefined);
    setIsZipCodeValid(validateZip());
  };

  console.log("state value:", state);

  return (
    <div className={"grid-row grid-gap"}>
      <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
        <WithErrorBar className={"padding-bottom-1"} hasError={isCityFieldInvalid} type={"ALWAYS"}>
          <label htmlFor="mailingAddressCity">
            <span className={"text-bold"}>
              <Content>City</Content>
            </span>
            <GenericTextField
              inputWidth={"full"}
              {...props}
              fieldName="mailingAddressCity"
              handleChange={handleChangeCity}
              formContext={DataFormErrorMapContext}
              value={state.mailingAddressCity}
              error={isCityFieldInvalid}
              validationText="Enter a city."
              preventRefreshWhenUnmounted
              onValidation={() => performValidation("mailingAddressCity")}
            />
          </label>
        </WithErrorBar>
      </span>
      <span className={`${isMobile ? "grid-col-6" : ""}`}>
        <label htmlFor="mailingAddressState">
          <span className={"text-bold"}>
            <Content>State</Content>
          </span>
          <StateDropdown
            fieldName="mailingAddressState"
            onSelect={handleChangeState}
            value={state.mailingAddressState?.shortCode}
            error={isStateFieldInvalid}
            validationText="Enter a state."
            onValidation={() => performValidation("mailingAddressState")}
          />
        </label>
      </span>
      <span className={`${isMobile ? "grid-col-6" : "grid-col-4"}`}>
        <label htmlFor="mailingAddressZipCode">
          <span className={"text-bold"}>
            <Content>City</Content>
          </span>
          <GenericTextField
            inputWidth={"full"}
            {...props}
            fieldName="mailingAddressZipCode"
            handleChange={handleChangeZipCode}
            formContext={DataFormErrorMapContext}
            value={state.mailingAddressZipCode}
            error={isZipCodeFieldInvalid}
            validationText="Enter a 5 digit zip code."
            preventRefreshWhenUnmounted
            onValidation={() => performValidation("mailingAddressZipCode")}
          />
        </label>
      </span>
    </div>
  );
};
