/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { ShowHideStatus } from "@/components/ShowHideToggleButton";
import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { MediaQueries } from "@/lib/PageSizes";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props
  extends Omit<
    ProfileDataFieldProps,
    "fieldName" | "handleChange" | "onValidation" | "inputWidth"
  > {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: () => ReactElement;
  taxIdDisplayStatus: ShowHideStatus;
}
export const SingleTaxId = ({
  handleChangeOverride,
  validationText,
  ...props
}: Props): ReactElement => {
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
      <GenericTextField
        allowMasking={true}
        disabled={props.taxIdDisplayStatus === "password-view"}
        fieldName={fieldName}
        formContext={DataFormErrorMapContext}
        handleChange={handleChange}
        inputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isTabletAndUp && props.getShowHideToggleButton()}
            </InputAdornment>
          ),
        }}
        inputWidth={"reduced"}
        numericProps={{ minLength: 9, maxLength: 12 }}
        type={props.taxIdDisplayStatus === "text-view" ? "text" : "password"}
        validationText={validationText}
        value={state.profileData[fieldName] as string | undefined}
        visualFilter={formatTaxId}
        {...props}
      />

      {!isTabletAndUp && (
        <div className="flex flex-justify-center margin-bottom-3">
          {props.getShowHideToggleButton()}
        </div>
      )}
    </div>
  );
};
