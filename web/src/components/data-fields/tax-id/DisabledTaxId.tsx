/* eslint-disable @typescript-eslint/no-explicit-any */

import { EncryptionStatus, TaxIdDisplayStatus } from "@/components/data-fields/tax-id/TaxIdHelpers";
import { ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptTaxId } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { MediaQueries } from "@/lib/PageSizes";
import { maskingCharacter, ProfileData } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Props = {
  template?: (props: { children: ReactNode }) => ReactElement<any>;
};
export const DisabledTaxId = (props: Props): ReactElement<any> => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  useEffect(() => {
    setTaxIdDisplayStatus(getTaxIdInitialStatus(getTaxIdEncryptionStatus(state.profileData)));
    updateSplitTaxId(state.profileData.taxId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.profileData.taxId]);

  const getTaxIdEncryptionStatus = (profileData: ProfileData | undefined): EncryptionStatus => {
    if (!profileData) {
      return;
    }
    if (!profileData.taxId?.includes(maskingCharacter) && profileData.encryptedTaxId) {
      return "decrypted";
    } else if (profileData.taxId?.includes(maskingCharacter) && profileData.encryptedTaxId) {
      return "encrypted";
    }
  };

  const getTaxIdInitialStatus = (encryptionStatus: EncryptionStatus): TaxIdDisplayStatus => {
    if (encryptionStatus === "encrypted") {
      return "password-view";
    } else {
      return "text-view";
    }
  };

  const taxIdInitialDisplay = (): TaxIdDisplayStatus => {
    return getTaxIdInitialStatus(getTaxIdEncryptionStatus(state.profileData));
  };

  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");
  const [taxIdDisplayStatus, setTaxIdDisplayStatus] = useState<TaxIdDisplayStatus>(taxIdInitialDisplay());
  const getShowHideToggleButton = (): ReactElement<any> => {
    return ShowHideToggleButton({
      status: taxIdDisplayStatus,
      toggle: updateTaxIdDisplay,
      showText: Config.tax.showButtonText,
      hideText: Config.tax.hideButtonText,
      useOverrideText: !isTabletAndUp,
      showOverrideText: Config.tax.showButtonTextMobile,
      hideOverrideText: Config.tax.hideButtonTextMobile,
    });
  };

  const updateSplitTaxId = (taxId: string): void => {
    setTaxIdValue(taxId.trim().slice(0, 9));
    setLocationValue(taxId.trim().slice(9, 12));
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

  const updateTaxIdDisplay = async (): Promise<void> => {
    if (!state.profileData.taxId) {
      return;
    } else if (
      taxIdDisplayStatus === "password-view" &&
      getTaxIdEncryptionStatus(state.profileData) === "encrypted"
    ) {
      await getDecryptedTaxId().then((decryptedTaxId) => {
        updateSplitTaxId(decryptedTaxId);
      });
    } else if (taxIdDisplayStatus === "text-view") {
      updateSplitTaxId(state.profileData.taxId);
    }
    toggleTaxIdDisplay();
  };

  const SimpleDiv = (props: { children: ReactNode }): ReactElement<any> => (
    <div className="flex">
      <div>{props.children}</div>
    </div>
  );
  const Element = props.template ?? SimpleDiv;
  const value = useMemo(() => {
    return formatTaxId(taxIdValue + locationValue);
  }, [locationValue, taxIdValue]);

  const getSpacedValue = (value: string): ReactNode => (
    <>
      {taxIdDisplayStatus === "password-view" ? (
        <span data-testid={"disabled-tax-id-value"} className={"password-view"}>
          {"****-****-****"}
        </span>
      ) : (
        <span data-testid={"disabled-tax-id-value"}>{value}</span>
      )}
    </>
  );

  return (
    <div className={"flex flex-row width-100"} data-testid={"disabled-taxid"}>
      <Element>{getSpacedValue(value)}</Element>
      <div className="margin-left-1">{getShowHideToggleButton()}</div>
    </div>
  );
};
