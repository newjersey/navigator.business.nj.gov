import { NumericField } from "@/components/data-fields/NumericField";
import { ShowHideStatus, ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { getInitialShowHideStatus, isEncrypted } from "@/lib/utils/encryption";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
}

export const TaxPin = (props: Props): ReactElement => {
  const fieldName = "taxPin";
  const { Config } = useConfig();
  const { business } = useUserData();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const taxPinIsEncrypted = isEncrypted(
    state.profileData[fieldName],
    state.profileData.encryptedTaxPin,
  );
  const [showHideStatus, setShowHideStatus] = useState<ShowHideStatus>(
    getInitialShowHideStatus(business?.profileData[fieldName]),
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["taxPin"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  const getShowHideToggleButton = (): ReactElement => {
    return (
      <ShowHideToggleButton
        status={showHideStatus}
        toggle={toggleShowHide}
        showText={Config.profileDefaults.fields.taxPin.default.showButtonText}
        hideText={Config.profileDefaults.fields.taxPin.default.hideButtonText}
        useOverrideText={!isTabletAndUp}
        showOverrideText={Config.profileDefaults.fields.taxPin.default.showButtonTextMobile}
        hideOverrideText={Config.profileDefaults.fields.taxPin.default.hideButtonTextMobile}
      />
    );
  };

  const toggleShowHide = async (): Promise<void> => {
    if (showHideStatus === "password-view" && taxPinIsEncrypted) {
      await decryptValue({
        encryptedValue: state.profileData.encryptedTaxPin as string,
      }).then((decryptedValue) => {
        setProfileData({ ...state.profileData, taxPin: decryptedValue });
      });
    }

    if (showHideStatus === "password-view") {
      setShowHideStatus("text-view");
    } else {
      setShowHideStatus("password-view");
    }
  };

  return (
    <>
      <NumericField
        inputWidth={props.inputWidth ?? "reduced"}
        allowMasking={true}
        disabled={showHideStatus === "password-view"}
        fieldName={fieldName}
        maxLength={4}
        minLength={4}
        type={showHideStatus === "text-view" ? "text" : "password"}
        validationText={contentFromConfig.errorTextRequired}
        handleChange={props.handleChangeOverride}
        inputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {isTabletAndUp && getShowHideToggleButton()}
            </InputAdornment>
          ),
        }}
      />
      {!isTabletAndUp && (
        <div className="flex flex-justify-center margin-bottom-3">{getShowHideToggleButton()}</div>
      )}
    </>
  );
};
