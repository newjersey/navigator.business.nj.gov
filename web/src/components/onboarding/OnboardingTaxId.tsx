/* eslint-disable @typescript-eslint/no-explicit-any */

import { ButtonIcon } from "@/components/ButtonIcon";
import { GenericTextField } from "@/components/GenericTextField";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
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

  const getInitialDisplayType = () => {
    if (
      state.profileData.taxId &&
      state.profileData.taxId.includes(maskingCharacter) &&
      state.profileData.encryptedTaxId
    ) {
      return "MASKED";
    } else {
      return "PLAIN";
    }
  };

  useEffect(() => {
    if (userData?.profileData.taxId?.includes(maskingCharacter)) {
      setDisplayTaxId(false);
    }
  }, [userData?.profileData.taxId]);

  const initialType = useRef<"FULL" | "SPLIT">(getFieldType());
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  type ErrorMapType = { taxId: boolean; taxIdLocation: boolean };
  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");
  const [errorMap, setErrorMap] = useState<ErrorMapType>({ taxId: false, taxIdLocation: false });
  const initialDisplayType = useRef<"MASKED" | "PLAIN">(getInitialDisplayType());
  const [displayTaxId, setDisplayTaxId] = useState<boolean>(initialDisplayType.current == "PLAIN");

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

  const setSplitTaxId = (taxId: string) => {
    setTaxIdValue(taxId.trim().slice(0, 9));
    setLocationValue(taxId.trim().slice(9, 12));
  };

  const toggleTaxIdDisplay = async () => {
    if (!state.profileData.taxId) {
      return;
    }
    if (!state.profileData.taxId.includes(maskingCharacter) && !displayTaxId) {
      if (initialType.current == "SPLIT") {
        setSplitTaxId(state.profileData.taxId);
      }
      setDisplayTaxId(true);
    } else if (
      state.profileData.taxId.includes(maskingCharacter) &&
      !displayTaxId &&
      state.profileData.encryptedTaxId
    ) {
      const decryptedTaxId = await decryptTaxId({ encryptedTaxId: state.profileData.encryptedTaxId });
      setProfileData({ ...state.profileData, taxId: decryptedTaxId });
      if (initialType.current == "SPLIT") {
        setSplitTaxId(decryptedTaxId);
      }
      setDisplayTaxId(true);
    } else {
      setDisplayTaxId(false);
    }
  };

  const hideButtonText = () => {
    return isTabletAndUp ? Config.tax.hideButtonText : Config.tax.hideButtonTextMobile;
  };

  const showButtonText = () => {
    return isTabletAndUp ? Config.tax.showButtonText : Config.tax.showButtonTextMobile;
  };

  const showHideToggleButton = () => {
    return (
      <UnStyledButton className="width-100" style="tertiary" align="start" onClick={toggleTaxIdDisplay}>
        <ButtonIcon svgFilename={displayTaxId ? "hide" : "show"} />
        <span className="underline">{displayTaxId ? hideButtonText() : showButtonText()}</span>
      </UnStyledButton>
    );
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
          disabled={!displayTaxId}
          type={displayTaxId ? "text" : "password"}
          fieldOptions={{
            sx: {
              maxWidth: props.forTaxTask ? "36rem" : "100%",
            },
          }}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end" className="margin-right-2">
                {isTabletAndUp && showHideToggleButton()}
              </InputAdornment>
            ),
          }}
          formInputFull={props.formInputFull ? true : false}
          {...props}
        />
        {!isTabletAndUp && (
          <div className="flex flex-justify-center margin-bottom-3">{showHideToggleButton()}</div>
        )}
      </div>
    );
  }

  return (
    <div className={isTabletAndUp ? "flex flex-row width-100" : "flex flex-column width-100"}>
      <div className="flex flex-row">
        <GenericTextField
          ref={taxIdBoxRef}
          value={taxIdValue}
          fieldOptions={{
            sx: {
              textAlign: "center",
              textAlignLast: "center",
              maxWidth: props.forTaxTask ? "27rem" : "9em",
            },
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
          disabled={!displayTaxId}
          type={displayTaxId ? "text" : "password"}
          onValidation={onValidation}
          allowMasking={true}
        />
        <span className="padding-x-2 padding-bottom-2 flex-align-self-center ">/</span>
        <GenericTextField
          ref={locationBoxRef}
          value={locationValue}
          error={error}
          fieldOptions={{ sx: { textAlignLast: "center", maxWidth: "4em" } }}
          fieldName={"taxIdLocation"}
          {...props}
          numericProps={{ minLength: 3, maxLength: 3 }}
          handleChange={(value) => {
            handleChange(value, "taxIdLocation");
          }}
          disabled={!displayTaxId}
          type={displayTaxId ? "text" : "password"}
          onValidation={onValidation}
          allowMasking={true}
        />
      </div>
      <div
        className={
          isTabletAndUp
            ? "margin-left-5 padding-top-3 padding-x-3"
            : "flex flex-justify-center margin-bottom-3"
        }
      >
        {showHideToggleButton()}
      </div>
    </div>
  );
};
