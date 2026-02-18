import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { SingleTaxId } from "@/components/data-fields/tax-id/SingleTaxId";
import { type ShowHideStatus, ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { getInitialShowHideStatus, isEncrypted } from "@/lib/utils/encryption";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

export interface Props
  extends Omit<
    ProfileDataFieldProps,
    "fieldName" | "handleChange" | "onValidation" | "inputWidth"
  > {
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
  dbBusinessTaxId: string | undefined;
}

export const TaxId = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const taxIdIsEncrypted = isEncrypted(state.profileData.taxId, state.profileData.encryptedTaxId);
  const [taxIdDisplayStatus, setTaxIdDisplayStatus] = useState<ShowHideStatus>(
    getInitialShowHideStatus(props.dbBusinessTaxId),
  );

  const getShowHideToggleButton = (toggleFunc?: (taxId: string) => void): ReactElement => {
    return (
      <ShowHideToggleButton
        status={taxIdDisplayStatus}
        toggle={taxIdToggle(toggleFunc)}
        showText={Config.taxId.showButtonText}
        hideText={Config.taxId.hideButtonText}
        useOverrideText={!isTabletAndUp}
        showOverrideText={Config.taxId.showButtonTextMobile}
        hideOverrideText={Config.taxId.hideButtonTextMobile}
      />
    );
  };

  const getDecryptedTaxId = async (): Promise<string> => {
    return decryptValue({
      encryptedValue: state.profileData.encryptedTaxId as string,
    });
  };

  const toggleTaxIdDisplay = (): void => {
    taxIdDisplayStatus === "password-view"
      ? setTaxIdDisplayStatus("text-view")
      : setTaxIdDisplayStatus("password-view");
  };

  const taxIdToggle = (toggleFunc?: (taxId: string) => void) => async (): Promise<void> => {
    if (taxIdDisplayStatus === "password-view") {
      if (taxIdIsEncrypted) {
        await getDecryptedTaxId().then((decryptedTaxId) => {
          setProfileData({ ...state.profileData, taxId: decryptedTaxId });
          toggleFunc && toggleFunc(decryptedTaxId);
        });
      } else {
        toggleFunc && state.profileData.taxId && toggleFunc(state.profileData.taxId);
      }
    }
    toggleTaxIdDisplay();
  };

  const additionalValidationIsValid = (value: string): boolean => {
    // Clean both values for comparison (remove all non-digits)
    const cleanValue = value.replaceAll(/\D/g, "");
    const cleanDbValue = (props.dbBusinessTaxId || "").replaceAll(/\D/g, "");

    // Empty value is valid only if not required
    if (cleanValue.length === 0) {
      return !props.required;
    }

    // 12 digits is always valid
    if (cleanValue.length === 12) {
      return true;
    }

    // 9 digits is valid if:
    // 1. No existing DB value (new entry), OR
    // 2. Matches the existing DB value (unchanged)
    if (cleanValue.length === 9) {
      return cleanDbValue.length === 0 || cleanDbValue === cleanValue;
    }

    // Invalid: 1-8, 10-11, 13+ digits
    // But allow if unchanged from DB value (for partially masked values)
    return cleanDbValue === cleanValue;
  };

  return (
    <SingleTaxId
      getShowHideToggleButton={getShowHideToggleButton}
      taxIdDisplayStatus={taxIdDisplayStatus}
      additionalValidationIsValid={additionalValidationIsValid}
      validationText={Config.profileDefaults.fields.taxId.default.errorTextRequired}
      {...props}
    />
  );
};
