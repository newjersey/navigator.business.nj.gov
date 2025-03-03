/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { TaxIdDisplayStatus } from "@/components/data-fields/tax-id/TaxIdHelpers";
import { DataFieldFormContext } from "@/contexts/dataFieldFormContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { MediaQueries } from "@/lib/PageSizes";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props
  extends Omit<ProfileDataFieldProps, "fieldName" | "handleChange" | "onValidation" | "inputWidth"> {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: () => ReactElement;
  taxIdDisplayStatus: TaxIdDisplayStatus;
}
export const SingleTaxId = ({ handleChangeOverride, validationText, ...props }: Props): ReactElement => {
  const fieldName = "taxId";
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const { state, setProfileData } = useContext(ProfileDataContext);
  const { isFormFieldInvalid } = useFormContextFieldHelpers(fieldName, DataFieldFormContext);

  const handleChange = (value: string): void => {
    if (handleChangeOverride) {
      handleChangeOverride(value);
      return;
    }
    setProfileData({
      ...state.profileData,
      [fieldName]: value,
    });
  };

  return (
    <div className={isTabletAndUp ? "" : "flex flex-column"}>
      <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS">
        <GenericTextField
          allowMasking={true}
          disabled={props.taxIdDisplayStatus === "password-view"}
          fieldName={fieldName}
          formContext={DataFieldFormContext}
          handleChange={handleChange}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isTabletAndUp && props.getShowHideToggleButton()}
              </InputAdornment>
            ),
          }}
          inputWidth={"reduced"}
          numericProps={{ minLength: 12, maxLength: 12 }}
          type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
          validationText={validationText}
          value={state.profileData[fieldName] as string | undefined}
          visualFilter={formatTaxId}
          {...props}
        />
      </WithErrorBar>

      {!isTabletAndUp && (
        <div className="flex flex-justify-center margin-bottom-3">{props.getShowHideToggleButton()}</div>
      )}
    </div>
  );
};
