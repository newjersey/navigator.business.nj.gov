/* eslint-disable @typescript-eslint/no-explicit-any */

import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { TaxIdDisplayStatus } from "@/components/onboarding/taxId/OnboardingTaxIdHelpers";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { MediaQueries } from "@/lib/PageSizes";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props extends Omit<OnboardingProps, "fieldName" | "handleChange" | "onValidation"> {
  handleChangeOverride?: (value: string) => void;
  getShowHideToggleButton: () => ReactElement;
  taxIdDisplayStatus: TaxIdDisplayStatus;
}
export const OnboardingSingleTaxId = ({
  handleChangeOverride,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);

  const handleChange = (value: string) => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
    }
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
    <div className={isTabletAndUp ? "width-100" : "flex flex-column width-100"}>
      <OnboardingField
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
        formInputFull={props.formInputFull ? true : false}
        {...props}
      />
      {!isTabletAndUp && (
        <div className="flex flex-justify-center margin-bottom-3">{props.getShowHideToggleButton()}</div>
      )}
    </div>
  );
};
