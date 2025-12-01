/* eslint-disable @typescript-eslint/no-explicit-any */

import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import {
  TaxIdFormContext,
  taxIdFormContextErrorMap,
} from "@/components/data-fields/tax-id/TaxIdFormContext";
import { GenericTextField } from "@/components/GenericTextField";
import { ShowHideStatus } from "@/components/ShowHideToggleButton";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useRef, useState } from "react";

interface Props
  extends Omit<
    ProfileDataFieldProps,
    "fieldName" | "handleChange" | "onValidation" | "inputWidth"
  > {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: (toggleFunc?: (taxId: string) => void) => ReactElement;
  taxIdDisplayStatus: ShowHideStatus;
}
export const SplitTaxId = ({
  handleChangeOverride,
  additionalValidationIsValid,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const [locationValue, setLocationValue] = useState(
    state.profileData[fieldName]?.trim().slice(9, 12) ?? "",
  );
  const [taxIdValue, setTaxIdValue] = useState(
    state.profileData[fieldName]?.trim().slice(0, 9) ?? "",
  );

  const { isValid, state: formContextState } = useFormContextHelper(taxIdFormContextErrorMap);

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    fieldName,
    DataFormErrorMapContext,
  );

  RegisterForOnSubmit(
    () =>
      isValid() &&
      (additionalValidationIsValid && !!state.profileData.taxId
        ? additionalValidationIsValid(state.profileData.taxId)
        : true),
  );

  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["taxId"]["default"] =
    getProfileConfig({
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
    <TaxIdFormContext.Provider value={formContextState}>
      <div className="grid-row">
        <div className="grid-col-7 tablet:grid-col-7">
          <GenericTextField
            ref={taxIdBoxRef}
            value={taxIdValue}
            formContext={TaxIdFormContext}
            fieldOptions={{
              FormHelperTextProps: { sx: { whiteSpace: "nowrap" } },
            }}
            fieldName={fieldName as string}
            error={isFormFieldInvalid}
            visualFilter={formatTaxId}
            numericProps={{ minLength: 9, maxLength: 9 }}
            validationText={validationText ?? contentFromConfig.errorTextRequired ?? ""}
            handleChange={(value): void => {
              handleChange(value, "taxId");
            }}
            onValidation={(fieldName: string, invalid: boolean): void => setIsValid(!invalid)}
            disabled={props.taxIdDisplayStatus === "password-view"}
            type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
            allowMasking={true}
            inputWidth={"reduced"}
            {...props}
          />
        </div>
        <div className="grid-col-5 tablet:grid-col-3 flex">
          <span className="padding-x-2 padding-top-2">/</span>
          <GenericTextField
            inputWidth={"full"}
            ref={locationBoxRef}
            value={locationValue}
            formContext={TaxIdFormContext}
            className={"grid-col flex-fill"}
            error={isFormFieldInvalid}
            fieldName={"taxIdLocation"}
            numericProps={{ minLength: 3, maxLength: 3 }}
            handleChange={(value): void => {
              handleChange(value, "taxIdLocation");
            }}
            onValidation={(fieldName: string, invalid: boolean): void => setIsValid(!invalid)}
            disabled={props.taxIdDisplayStatus === "password-view"}
            type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
            allowMasking={true}
            {...props}
          />
        </div>
        <div className="grid-col-12 tablet:grid-col-2">
          <div
            className={
              isTabletAndUp ? "margin-top-2 margin-left-3" : "flex flex-justify-center margin-y-2"
            }
          >
            {props.getShowHideToggleButton(updateSplitTaxId)}
          </div>
        </div>
      </div>
    </TaxIdFormContext.Provider>
  );
};
