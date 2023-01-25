/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericTextField } from "@/components/GenericTextField";
import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { maskingCharacter } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useRef, useState } from "react";

interface Props extends Omit<OnboardingProps, "fieldName" | "handleChange"> {
  fieldStates: ProfileFieldErrorMap;
  handleChangeOverride?: (value: string) => void;
  forTaxTask?: boolean;
}
export const OnboardingTaxId = ({
  handleChangeOverride,
  className,
  fieldStates,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

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

  const initialType = useRef<"FULL" | "SPLIT">(getFieldType());
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  type ErrorMapType = { taxId: boolean; taxIdLocation: boolean };
  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");
  const [errorMap, setErrorMap] = useState<ErrorMapType>({ taxId: false, taxIdLocation: false });

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
    if (value.includes(maskingCharacter)) {
      value = "";
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

  const error = fieldStates[fieldName].invalid;

  if (initialType.current === "FULL") {
    return (
      <OnboardingField
        error={error}
        fieldName={fieldName}
        visualFilter={formatTaxId}
        validationText={validationText}
        numericProps={{ minLength: 12, maxLength: 12 }}
        handleChange={handleChangeFullTaxId}
        allowMasking={true}
        className={props.forTaxTask ? "width-100" : ""}
        {...props}
      />
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-row ">
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
          onValidation={onValidation}
        />
      </div>
    </div>
  );
};
