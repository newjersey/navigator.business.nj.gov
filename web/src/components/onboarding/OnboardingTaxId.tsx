/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptTaxId } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { maskingCharacter } from "@businessnjgovnavigator/shared";
import { InputAdornment, useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

interface Props extends Omit<OnboardingProps, "fieldName" | "handleChange"> {
  fieldStates: ProfileFieldErrorMap;
  handleChangeOverride?: (value: string) => void;
  forTaxTask?: boolean;
}
export const OnboardingTaxId = ({
  handleChangeOverride,
  fieldStates,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { userData } = useUserData();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const getFieldType = () => {
    const initialValue = state.profileData[fieldName]?.trim().length ?? 0;
    if (initialValue === 0 || initialValue === 12) {
      return "FULL";
    }
    return "SPLIT";
  };

  const taxIdInitialDisplay = () => {
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

  useEffect(() => {
    if (userData?.profileData.taxId?.includes(maskingCharacter)) {
      setTaxIdDisplayStatus("password-view");
    }
  }, [userData?.profileData.taxId]);

  const initialType = useRef<"FULL" | "SPLIT">(getFieldType());
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  type ErrorMapType = { taxId: boolean; taxIdLocation: boolean };
  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");
  const [errorMap, setErrorMap] = useState<ErrorMapType>({ taxId: false, taxIdLocation: false });
  const [taxIdDisplayStatus, setTaxIdDisplayStatus] = useState<"text-view" | "password-view">(
    taxIdInitialDisplay()
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["taxId"]["default"] = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: "taxId",
  });

  const handleChange = (value: string, type: "taxId" | "taxIdLocation") => {
    let resolvedValue = "".concat(...taxIdValue, ...locationValue);
    if (type === "taxId") {
      setTaxIdValue(value);
      resolvedValue = "".concat(...value, ...locationValue);
      if (value.length === 9) {
        locationBoxRef.current?.querySelector("input")?.focus();
      }
    }
    if (type === "taxIdLocation") {
      resolvedValue = "".concat(...taxIdValue, ...value);
      setLocationValue(value);
    }

    if (handleChangeOverride) {
      handleChangeOverride(resolvedValue);
      return;
    }

    const profileData = { ...state.profileData };
    profileData[fieldName] = resolvedValue;
    setProfileData(profileData);
  };

  const handleChangeFullTaxId = (value: string) => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
    }

    setProfileData({
      ...state.profileData,
      [fieldName]: value,
    });
  };

  const onValidation = (valFieldName: string, invalid: boolean) => {
    const errors = (errorMap: ErrorMapType) => {
      return { ...errorMap, [valFieldName]: invalid };
    };
    setErrorMap((errorMap) => {
      return errors(errorMap);
    });
    props.onValidation && props.onValidation(fieldName, Object.values(errors(errorMap)).includes(true));
  };

  const getShowHideToggleButton = () => {
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

  const updateSplitTaxId = (taxId: string) => {
    setTaxIdValue(taxId.trim().slice(0, 9));
    setLocationValue(taxId.trim().slice(9, 12));
  };

  const getTaxIdEncryptionStatus = (): string | undefined => {
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

  const toggleTaxIdDisplay = () => {
    taxIdDisplayStatus === "password-view"
      ? setTaxIdDisplayStatus("text-view")
      : setTaxIdDisplayStatus("password-view");
  };

  const updateTaxIdDisplay = async () => {
    if (!state.profileData.taxId) {
      return;
    } else if (taxIdDisplayStatus === "password-view" && getTaxIdEncryptionStatus() === "encrypted") {
      await getDecryptedTaxId().then((decryptedTaxId) => {
        setProfileData({ ...state.profileData, taxId: decryptedTaxId });
        updateSplitTaxId(decryptedTaxId);
      });
    } else if (
      taxIdDisplayStatus === "password-view" &&
      getTaxIdEncryptionStatus() === "decrypted" &&
      initialType.current == "SPLIT"
    ) {
      updateSplitTaxId(state.profileData.taxId);
    }

    toggleTaxIdDisplay();
  };

  const error = fieldStates[fieldName].invalid;

  if (initialType.current === "FULL") {
    return (
      <div className={isTabletAndUp ? "width-100" : "flex flex-column width-100"}>
        <OnboardingField
          error={error}
          fieldName={fieldName}
          visualFilter={formatTaxId}
          validationText={validationText}
          numericProps={{ minLength: 12, maxLength: 12 }}
          handleChange={handleChangeFullTaxId}
          allowMasking={true}
          disabled={taxIdDisplayStatus === "password-view"}
          type={taxIdDisplayStatus === "text-view" ? "text" : "password"}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end" className="margin-right-2">
                {isTabletAndUp && getShowHideToggleButton()}
              </InputAdornment>
            ),
          }}
          formInputFull={props.formInputFull ? true : false}
          {...props}
        />
        {!isTabletAndUp && (
          <div className="flex flex-justify-center margin-bottom-3">{getShowHideToggleButton()}</div>
        )}
      </div>
    );
  }

  return (
    <div className={isTabletAndUp ? "flex flex-row width-100" : "flex flex-column"}>
      <div className="grid-row width-100">
        <div className="grid-col">
          <GenericTextField
            ref={taxIdBoxRef}
            value={taxIdValue}
            fieldOptions={{
              FormHelperTextProps: { sx: { whiteSpace: "nowrap" } },
            }}
            fieldName={fieldName as string}
            error={error}
            visualFilter={formatTaxId}
            {...props}
            numericProps={{ minLength: 9, maxLength: 9 }}
            validationText={validationText ?? contentFromConfig.errorTextRequired ?? ""}
            handleChange={(value) => {
              handleChange(value, "taxId");
            }}
            disabled={taxIdDisplayStatus === "password-view"}
            type={taxIdDisplayStatus === "text-view" ? "text" : "password"}
            onValidation={onValidation}
            allowMasking={true}
          />
        </div>
        <div className="grid-row">
          <span className="padding-x-2 padding-bottom-2 flex-align-self-center ">/</span>
          <GenericTextField
            ref={locationBoxRef}
            value={locationValue}
            className={"grid-col flex-fill"}
            error={error}
            fieldOptions={{ sx: { textAlignLast: "center", maxWidth: "4em" } }}
            fieldName={"taxIdLocation"}
            {...props}
            numericProps={{ minLength: 3, maxLength: 3 }}
            handleChange={(value) => {
              handleChange(value, "taxIdLocation");
            }}
            disabled={taxIdDisplayStatus === "password-view"}
            type={taxIdDisplayStatus === "text-view" ? "text" : "password"}
            onValidation={onValidation}
            allowMasking={true}
          />
        </div>
      </div>

      <div
        className={isTabletAndUp ? "margin-x-3 padding-top-3" : "flex flex-justify-center margin-bottom-3"}
      >
        {getShowHideToggleButton()}
      </div>
    </div>
  );
};
