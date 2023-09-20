/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { TaxIdDisplayStatus } from "@/components/data-fields/tax-id/TaxIdHelpers";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { MediaQueries } from "@/lib/PageSizes";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props extends Omit<DataFieldProps, "fieldName" | "handleChange" | "onValidation" | "inputWidth"> {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: () => ReactElement;
  taxIdDisplayStatus: TaxIdDisplayStatus;
}
export const SingleTaxId = ({ handleChangeOverride, validationText, ...props }: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);

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
      <DataField
        inputWidth={"reduced"}
        fieldName={fieldName}
        visualFilter={formatTaxId}
        validationText={validationText}
        numericProps={{ minLength: 12, maxLength: 12 }}
        handleChange={handleChange}
        allowMasking={true}
        disabled={props.taxIdDisplayStatus === "password-view"}
        type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
        inputProps={{
          endAdornment: (
            <InputAdornment position="end">{isTabletAndUp && props.getShowHideToggleButton()}</InputAdornment>
          ),
        }}
        {...props}
      />
      {!isTabletAndUp && (
        <div className="flex flex-justify-center margin-bottom-3">{props.getShowHideToggleButton()}</div>
      )}
    </div>
  );
};
