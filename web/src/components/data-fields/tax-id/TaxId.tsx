import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { SingleTaxId } from "@/components/data-fields/tax-id/SingleTaxId";
import { SplitTaxId } from "@/components/data-fields/tax-id/SplitTaxId";
import { type ShowHideStatus, ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { getInitialShowHideStatus, isEncrypted } from "@/lib/utils/encryption";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useRef, useState } from "react";

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
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const getFieldType = (): "FULL" | "SPLIT" => {
    const initialValue = state.profileData[fieldName]?.trim().length ?? 0;
    if (initialValue === 0 || initialValue === 12) {
      return "FULL";
    }
    return "SPLIT";
  };

  const initialType = useRef<"FULL" | "SPLIT">(getFieldType());

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
    if (
      !(value.length === 0 || value.length === 12) &&
      (props.dbBusinessTaxId !== value || props.required)
    ) {
      return false;
    }

    return true;
  };

  if (initialType.current === "FULL") {
    return (
      <SingleTaxId
        getShowHideToggleButton={getShowHideToggleButton}
        taxIdDisplayStatus={taxIdDisplayStatus}
        additionalValidationIsValid={additionalValidationIsValid}
        validationText={Config.profileDefaults.fields.taxId.default.errorTextRequired}
        {...props}
      />
    );
  } else {
    return (
      <SplitTaxId
        getShowHideToggleButton={getShowHideToggleButton}
        taxIdDisplayStatus={taxIdDisplayStatus}
        additionalValidationIsValid={additionalValidationIsValid}
        {...props}
      />
    );
  }
};
