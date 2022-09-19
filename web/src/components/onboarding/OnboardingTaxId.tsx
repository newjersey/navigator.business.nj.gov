/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ReactElement, useContext, useRef, useState } from "react";

interface Props extends Omit<OnboardingProps, "fieldName" | "handleChange"> {
  fieldStates: ProfileFieldErrorMap;
  splitField?: boolean;
  handleChangeOverride?: (value: string) => void;
}
export const OnboardingTaxId = ({
  handleChangeOverride,
  className,
  fieldStates,
  inputErrorBar,
  validationText,
  ...props
}: Props): ReactElement => {
  const fieldName = "taxId";

  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const getFieldType = () => {
    const initialValue = state.profileData[fieldName]?.trim().length ?? 0;
    if (initialValue == 0 || initialValue == 12) return "FULL";
    return "SPLIT";
  };

  const initialType = useRef<"FULL" | "SPLIT">(props.splitField ? getFieldType() : "FULL");
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const taxIdBoxRef = useRef<HTMLDivElement>(null);

  const [locationValue, setLocationValue] = useState(state.profileData[fieldName]?.trim().slice(9, 12) ?? "");
  const [taxIdValue, setTaxIdValue] = useState(state.profileData[fieldName]?.trim().slice(0, 9) ?? "");
  const [errorMap, setErrorMap] = useState({ taxId: false, taxIdLocation: false });

  const handleChange = (value: string, type: "taxId" | "taxIdLocation") => {
    let resolvedValue = "".concat(...taxIdValue, ...locationValue);
    if (type == "taxId") {
      setTaxIdValue(value);
      resolvedValue = "".concat(...value, ...locationValue);
      if (value.length === 9) locationBoxRef.current?.querySelector("input")?.focus();
    }
    if (type == "taxIdLocation") {
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

  const onValidation = (valFieldName: string, invalid: boolean) => {
    const errors = { ...errorMap, [valFieldName]: invalid };
    setErrorMap(errors);
    props.onValidation &&
      props.onValidation(
        fieldName,
        Object.values(errors).some((v) => v == true)
      );
  };

  const headerLevelTwo = setHeaderRole(props.headerAriaLevel ?? 2, "h3-styling");

  const error = fieldStates[fieldName].invalid;

  if (initialType.current == "FULL")
    return (
      <OnboardingField
        error={error}
        fieldName={fieldName}
        visualFilter={formatTaxId}
        validationText={validationText}
        inputErrorBar={inputErrorBar}
        numericProps={{ minLength: 9, maxLength: 12 }}
        handleChange={handleChangeOverride}
        {...props}
      />
    );

  return (
    <div className={`${className} ${inputErrorBar ? "input-error-bar" : ""} ${error ? "error" : ""}`}>
      {!props.hideHeader && (
        <Content className="margin-bottom-105" overrides={{ h2: headerLevelTwo }}>
          {props.headerMarkdown ?? Config.profileDefaults[state.flow][fieldName].header}
        </Content>
      )}

      {!props.hideDescription &&
        (Object.keys(Config.profileDefaults[state.flow][fieldName]).includes("description") ||
          props.descriptionMarkdown) && (
          <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${fieldName}`}>
            <Content>
              {props.descriptionMarkdown ??
                (Config.profileDefaults[state.flow][fieldName] as any).description}
            </Content>
          </div>
        )}

      <div className="flex flex-row">
        <GenericTextField
          ref={taxIdBoxRef}
          value={taxIdValue}
          fieldOptions={{
            sx: { textAlign: "center", textAlignLast: "center", maxWidth: "9em" },
            FormHelperTextProps: { sx: { whiteSpace: "nowrap" } },
          }}
          fieldName={fieldName as string}
          error={error}
          visualFilter={formatTaxId}
          {...props}
          numericProps={{ minLength: 9, maxLength: 9 }}
          validationText={
            validationText ?? (Config.profileDefaults[state.flow][fieldName] as any).errorTextRequired ?? ""
          }
          handleChange={(value) => {
            handleChange(value, "taxId");
          }}
          onValidation={onValidation}
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
