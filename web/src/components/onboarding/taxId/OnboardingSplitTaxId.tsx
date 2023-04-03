/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { OnboardingProps } from "@/components/onboarding/OnboardingField";
import { TaxIdDisplayStatus } from "@/components/onboarding/taxId/OnboardingTaxIdHelpers";
import { taxIdFormContext, taxIdFormContextErrorMap } from "@/components/onboarding/taxIdFormContext";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useRef, useState } from "react";

interface Props extends Omit<OnboardingProps, "fieldName" | "handleChange" | "onValidation"> {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: (toggleFunc?: (taxId: string) => void) => ReactElement;
  taxIdDisplayStatus: TaxIdDisplayStatus;
}
export const OnboardingSplitTaxId = ({
  handleChangeOverride,
  additionalValidationIsValid,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");

  const { isValid, state: formContextState } = useFormContextHelper(taxIdFormContextErrorMap);

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    fieldName,
    profileFormContext
  );

  RegisterForOnSubmit(
    () =>
      isValid() &&
      (additionalValidationIsValid && !!state.profileData.taxId
        ? additionalValidationIsValid(state.profileData.taxId)
        : true)
  );

  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["taxId"]["default"] = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: "taxId",
  });

  const updateSplitTaxId = (taxId: string): void => {
    setTaxIdValue(taxId.trim().slice(0, 9));
    setLocationValue(taxId.trim().slice(9, 12));
  };

  const handleChange = (value: string, type: "taxId" | "taxIdLocation"): void => {
    let resolvedValue: string;

    if (type === "taxId") {
      resolvedValue = "".concat(...value, ...locationValue);
      if (value.length === 9) {
        locationBoxRef.current?.querySelector("input")?.focus();
      }
    } else {
      resolvedValue = "".concat(...taxIdValue, ...value);
    }

    updateSplitTaxId(resolvedValue);

    if (handleChangeOverride) {
      handleChangeOverride(resolvedValue);
      return;
    }
    setProfileData((profileData) => ({ ...profileData, [fieldName]: resolvedValue }));
  };

  return (
    <taxIdFormContext.Provider value={formContextState}>
      <div className={isTabletAndUp ? "flex flex-row width-100" : "flex flex-column"}>
        <div className="grid-row width-100">
          <div className="grid-col">
            <GenericTextField
              ref={taxIdBoxRef}
              value={taxIdValue}
              formContext={taxIdFormContext}
              fieldOptions={{
                FormHelperTextProps: { sx: { whiteSpace: "nowrap" } },
              }}
              fieldName={fieldName as string}
              error={isFormFieldInValid}
              visualFilter={formatTaxId}
              numericProps={{ minLength: 9, maxLength: 9 }}
              validationText={validationText ?? contentFromConfig.errorTextRequired ?? ""}
              handleChange={(value): void => {
                handleChange(value, "taxId");
              }}
              onValidation={(fieldName: string, invalid: boolean): void => Validate(invalid)}
              disabled={props.taxIdDisplayStatus === "password-view"}
              type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
              allowMasking={true}
              {...props}
            />
          </div>
          <div className="grid-row">
            <span className="padding-x-2 padding-bottom-2 flex-align-self-center ">/</span>
            <GenericTextField
              ref={locationBoxRef}
              value={locationValue}
              formContext={taxIdFormContext}
              className={"grid-col flex-fill"}
              error={isFormFieldInValid}
              fieldOptions={{ sx: { textAlignLast: "center", maxWidth: "4em" } }}
              fieldName={"taxIdLocation"}
              numericProps={{ minLength: 3, maxLength: 3 }}
              handleChange={(value): void => {
                handleChange(value, "taxIdLocation");
              }}
              onValidation={(fieldName: string, invalid: boolean): void => Validate(invalid)}
              disabled={props.taxIdDisplayStatus === "password-view"}
              type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
              allowMasking={true}
              {...props}
            />
          </div>
        </div>

        <div
          className={
            isTabletAndUp ? "padding-top-3 margin-left-3" : "flex flex-justify-center margin-bottom-3"
          }
        >
          {props.getShowHideToggleButton(updateSplitTaxId)}
        </div>
      </div>
    </taxIdFormContext.Provider>
  );
};
