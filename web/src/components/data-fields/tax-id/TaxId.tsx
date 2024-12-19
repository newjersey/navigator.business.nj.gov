/* eslint-disable @typescript-eslint/no-explicit-any */

import { DataFieldProps } from "@/components/data-fields/DataField";
import { SingleTaxId } from "@/components/data-fields/tax-id/SingleTaxId";
import { SplitTaxId } from "@/components/data-fields/tax-id/SplitTaxId";
import { EncryptionStatus, TaxIdDisplayStatus } from "@/components/data-fields/tax-id/TaxIdHelpers";
import { ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptTaxId } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { maskingCharacter } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

interface Props extends Omit<DataFieldProps, "fieldName" | "handleChange" | "onValidation" | "inputWidth"> {
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
}

export const TaxId = (props: Props): ReactElement<any> => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { business } = useUserData();
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

  const taxIdInitialDisplay = (): TaxIdDisplayStatus => {
    if (
      state.profileData.taxId &&
      state.profileData.taxId.includes(maskingCharacter) &&
      state.profileData.encryptedTaxId
    ) {
      return "password-view";
    } else {
      return "text-view";
    }
  };

  const [taxIdDisplayStatus, setTaxIdDisplayStatus] = useState<TaxIdDisplayStatus>(taxIdInitialDisplay());

  useEffect(() => {
    if (business?.profileData.taxId?.includes(maskingCharacter)) {
      setTaxIdDisplayStatus("password-view");
    }
  }, [business?.profileData.taxId]);

  const getShowHideToggleButton = (toggleFunc?: (taxId: string) => void): ReactElement<any> => {
    return ShowHideToggleButton({
      status: taxIdDisplayStatus,
      toggle: taxIdToggle(toggleFunc),
      showText: Config.tax.showButtonText,
      hideText: Config.tax.hideButtonText,
      useOverrideText: !isTabletAndUp,
      showOverrideText: Config.tax.showButtonTextMobile,
      hideOverrideText: Config.tax.hideButtonTextMobile,
    });
  };

  const getTaxIdEncryptionStatus = (): EncryptionStatus => {
    if (!state.profileData.taxId) {
      return;
    }
    if (!state.profileData.taxId.includes(maskingCharacter) && state.profileData.encryptedTaxId) {
      return "decrypted";
    } else if (state.profileData.taxId.includes(maskingCharacter) && state.profileData.encryptedTaxId) {
      return "encrypted";
    }
  };

  const getDecryptedTaxId = async (): Promise<string> => {
    return decryptTaxId({
      encryptedTaxId: state.profileData.encryptedTaxId as string,
    });
  };

  const toggleTaxIdDisplay = (): void => {
    taxIdDisplayStatus === "password-view"
      ? setTaxIdDisplayStatus("text-view")
      : setTaxIdDisplayStatus("password-view");
  };

  const taxIdToggle = (toggleFunc?: (taxId: string) => void) => async (): Promise<void> => {
    if (!state.profileData.taxId) {
      return;
    }
    const encryptionStatus = getTaxIdEncryptionStatus();
    if (taxIdDisplayStatus === "password-view") {
      if (encryptionStatus === "encrypted") {
        await getDecryptedTaxId().then((decryptedTaxId) => {
          setProfileData({ ...state.profileData, taxId: decryptedTaxId });
          toggleFunc && toggleFunc(decryptedTaxId);
        });
      } else {
        toggleFunc && toggleFunc(state.profileData.taxId);
      }
    }
    toggleTaxIdDisplay();
  };

  const additionalValidationIsValid = (value: string): boolean => {
    if (!business) return true;
    if (
      !(value.length === 0 || value.length === 12) &&
      (business.profileData.taxId !== value || props.required)
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
