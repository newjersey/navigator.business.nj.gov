/* eslint-disable @typescript-eslint/no-explicit-any */

import { type ShowHideStatus, ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { MediaQueries } from "@/lib/PageSizes";
import { getInitialShowHideStatus, isEncrypted } from "@/lib/utils/encryption";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Props = {
  template?: (props: { children: ReactNode }) => ReactElement;
};

const SimpleDiv = (props: { children: ReactNode }): ReactElement => (
  <div className="flex">
    <div>{props.children}</div>
  </div>
);

export const DisabledTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const taxIdIsEncrypted = isEncrypted(state.profileData.taxId, state.profileData.encryptedTaxId);
  const [taxIdDisplayStatus, setTaxIdDisplayStatus] = useState<ShowHideStatus>(
    getInitialShowHideStatus(state.profileData.taxId),
  );

  const [locationValue, setLocationValue] = useState(
    state.profileData[fieldName]?.trim().slice(9, 12) ?? "",
  );
  const [taxIdValue, setTaxIdValue] = useState(
    state.profileData[fieldName]?.trim().slice(0, 9) ?? "",
  );

  const updateSplitTaxId = (taxId: string): void => {
    setTaxIdValue(taxId.trim().slice(0, 9));
    setLocationValue(taxId.trim().slice(9, 12));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTaxIdDisplayStatus(getInitialShowHideStatus(state.profileData.taxId));
      updateSplitTaxId(state.profileData.taxId ?? "");
    }, 0);
    return (): void => clearTimeout(timeoutId);
  }, [state.profileData.taxId, state.profileData.encryptedTaxId]);

  const getShowHideToggleButton = (): ReactElement => {
    return (
      <ShowHideToggleButton
        status={taxIdDisplayStatus}
        toggle={updateTaxIdDisplay}
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

  const updateTaxIdDisplay = async (): Promise<void> => {
    if (!state.profileData.taxId) {
      return;
    } else if (taxIdDisplayStatus === "password-view" && taxIdIsEncrypted) {
      await getDecryptedTaxId().then((decryptedTaxId) => {
        updateSplitTaxId(decryptedTaxId);
      });
    } else if (taxIdDisplayStatus === "text-view") {
      updateSplitTaxId(state.profileData.taxId);
    }
    toggleTaxIdDisplay();
  };

  const Element = useMemo(() => props.template ?? SimpleDiv, [props.template]);
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
