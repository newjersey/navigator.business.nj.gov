import { Content } from "@/components/Content";
import { MunicipalityDropdown } from "@/components/onboarding/MunicipalityDropdown";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { Municipality } from "@businessnjgovnavigator/shared/index";
import { Checkbox, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);
  const { userData } = useUserData();
  const { doesFieldHaveError, doSomeFieldsHaveError } = useFormationErrors();
  useEffect(
    function setAgentCheckboxFalseWhenAddressChanged() {
      const {
        agentUseBusinessAddress,
        agentOfficeAddressLine1,
        agentOfficeAddressLine2,
        agentOfficeAddressZipCode,
        agentOfficeAddressMunicipality,
        addressLine1,
        addressLine2,
        addressMunicipality,
        addressZipCode,
      } = state.formationFormData;

      if (
        agentUseBusinessAddress &&
        (agentOfficeAddressLine1 !== addressLine1 ||
          agentOfficeAddressLine2 !== addressLine2 ||
          agentOfficeAddressMunicipality?.name !== addressMunicipality?.name ||
          agentOfficeAddressZipCode !== addressZipCode)
      ) {
        setFormationFormData({
          ...state.formationFormData,
          agentUseBusinessAddress: false,
        });
      }
    },
    [state.formationFormData, setFormationFormData]
  );

  const resetAgentFieldsInteraction = (): void => {
    setFieldsInteracted(
      [
        "agentNumberOrManual",
        "agentNumber",
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressLine2",
        "agentOfficeAddressMunicipality",
        "agentOfficeAddressZipCode",
      ],
      { setToUninteracted: true }
    );
  };

  const handleRadioSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    resetAgentFieldsInteraction();
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        agentNumberOrManual: event.target.value as "NUMBER" | "MANUAL_ENTRY",
      };
    });
  };

  const toggleUseAccountInfo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setFormationFormData({
        ...state.formationFormData,
        agentName: userData?.user.name ?? "",
        agentEmail: userData?.user.email ?? "",
        agentUseAccountInfo: checked,
      });

      setFieldsInteracted(["agentName", "agentEmail"]);
    } else {
      setFormationFormData({
        ...state.formationFormData,
        agentUseAccountInfo: checked,
      });
    }
  };

  const shouldBeDisabled = (field: FormationFields, type: "ACCOUNT" | "ADDRESS"): boolean => {
    const isCorrespondingCheckboxChecked =
      type === "ACCOUNT"
        ? state.formationFormData.agentUseAccountInfo
        : state.formationFormData.agentUseBusinessAddress;
    const hasValue = !!state.formationFormData[field];
    return isCorrespondingCheckboxChecked && hasValue;
  };

  const toggleUseBusinessAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setFormationFormData({
        ...state.formationFormData,
        agentOfficeAddressLine1: state.formationFormData.addressLine1,
        agentOfficeAddressLine2: state.formationFormData.addressLine2,
        agentOfficeAddressMunicipality: state.formationFormData.addressMunicipality,
        agentOfficeAddressZipCode: state.formationFormData.addressZipCode,
        agentUseBusinessAddress: checked,
      });
      setFieldsInteracted([
        "agentOfficeAddressLine1",
        "agentOfficeAddressLine2",
        "agentOfficeAddressMunicipality",
        "agentOfficeAddressZipCode",
      ]);
    } else {
      setFormationFormData({
        ...state.formationFormData,
        agentUseBusinessAddress: checked,
      });
    }
  };

  return (
    <>
      <Content>{state.displayContent.agentNumberOrManual.contentMd}</Content>
      <div id="registeredAgent">
        <div className="form-input">
          <FormControl fullWidth>
            <RadioGroup
              aria-label="Registered Agent"
              name="registered-agent"
              value={state.formationFormData.agentNumberOrManual}
              onChange={handleRadioSelection}
              row
            >
              <FormControlLabel
                labelPlacement="end"
                style={{ marginTop: ".75rem", alignItems: "flex-start" }}
                data-testid="registered-agent-number"
                value="NUMBER"
                control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
                label={state.displayContent.agentNumberOrManual.radioButtonNumberText}
              />
              <FormControlLabel
                labelPlacement="end"
                data-testid="registered-agent-manual"
                style={{ marginTop: ".75rem", alignItems: "flex-start" }}
                value="MANUAL_ENTRY"
                control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
                label={state.displayContent.agentNumberOrManual.radioButtonManualText}
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="margin-top-2">
          {state.formationFormData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentNumberLabel}
                placeholder={Config.businessFormationDefaults.registeredAgentNumberPlaceholder}
                numericProps={{ minLength: 4, maxLength: 7 }}
                fieldName="agentNumber"
                required={true}
                validationText={Config.businessFormationDefaults.agentNumberErrorText}
                formInputFull
                errorBarType="ALWAYS"
              />
            </div>
          )}

          {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <div className="margin-top-3 margin-bottom-1">
                <FormControlLabel
                  label={Config.businessFormationDefaults.sameAgentInfoAsAccount}
                  control={
                    <Checkbox
                      checked={state.formationFormData.agentUseAccountInfo}
                      onChange={toggleUseAccountInfo}
                      id="same-agent-info-as-account-checkbox"
                    />
                  }
                />
              </div>
              <WithErrorBar
                hasError={doSomeFieldsHaveError(["agentName", "agentEmail"])}
                type="DESKTOP-ONLY"
                className="grid-row grid-gap-2"
              >
                <div className="tablet:grid-col-6">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentNameLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentNamePlaceholder}
                    required={true}
                    errorBarType="MOBILE-ONLY"
                    validationText={Config.businessFormationDefaults.agentNameErrorText}
                    fieldName="agentName"
                    disabled={shouldBeDisabled("agentName", "ACCOUNT")}
                    formInputFull
                  />
                </div>
                <div className="tablet:grid-col-6 margin-bottom-2">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentEmailLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentEmailPlaceholder}
                    fieldName="agentEmail"
                    errorBarType="MOBILE-ONLY"
                    required={true}
                    validationText={Config.businessFormationDefaults.agentEmailErrorText}
                    disabled={shouldBeDisabled("agentEmail", "ACCOUNT")}
                    formInputFull
                  />
                </div>
              </WithErrorBar>
              {state.formationFormData.businessLocationType == "NJ" && (
                <div className="margin-bottom-1">
                  <FormControlLabel
                    label={Config.businessFormationDefaults.sameAgentAddressAsBusiness}
                    control={
                      <Checkbox
                        checked={state.formationFormData.agentUseBusinessAddress}
                        onChange={toggleUseBusinessAddress}
                        id="same-agent-address-as-business-checkbox"
                      />
                    }
                  />
                </div>
              )}
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine1Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine1Placeholder}
                fieldName="agentOfficeAddressLine1"
                required={true}
                validationText={Config.businessFormationDefaults.agentOfficeAddressLine1ErrorText}
                disabled={shouldBeDisabled("agentOfficeAddressLine1", "ADDRESS")}
                formInputFull
                errorBarType="ALWAYS"
              />
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine2Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine2Placeholder}
                fieldName="agentOfficeAddressLine2"
                disabled={state.formationFormData.agentUseBusinessAddress}
                formInputFull
                errorBarType="NEVER"
              />
              <WithErrorBar
                type="DESKTOP-ONLY"
                hasError={doSomeFieldsHaveError([
                  "agentOfficeAddressMunicipality",
                  "agentOfficeAddressZipCode",
                ])}
                className="grid-row grid-gap-2 margin-top-2"
              >
                <div className="grid-col-12 tablet:grid-col-6">
                  <WithErrorBar
                    hasError={doesFieldHaveError("agentOfficeAddressMunicipality")}
                    type="MOBILE-ONLY"
                  >
                    <Content>{Config.businessFormationDefaults.registeredAgentMunicipalityLabel}</Content>
                    <div className="margin-top-2">
                      <MunicipalityDropdown
                        municipalities={municipalities}
                        fieldName={"agentOfficeAddressMunicipality"}
                        error={doesFieldHaveError("agentOfficeAddressMunicipality")}
                        disabled={shouldBeDisabled("agentOfficeAddressMunicipality", "ADDRESS")}
                        validationLabel="Error"
                        value={state.formationFormData.agentOfficeAddressMunicipality}
                        onSelect={(value: Municipality | undefined) => {
                          return setFormationFormData({
                            ...state.formationFormData,
                            agentOfficeAddressMunicipality: value,
                          });
                        }}
                        placeholderText={
                          Config.businessFormationDefaults.registeredAgentMunicipalityPlaceholder
                        }
                        helperText={Config.businessFormationDefaults.addressMunicipalityErrorText}
                      />
                    </div>
                  </WithErrorBar>
                </div>

                <div className="grid-col-5 tablet:grid-col-2">
                  <WithErrorBar hasError={doesFieldHaveError("agentOfficeAddressZipCode")} type="MOBILE-ONLY">
                    <Content>{Config.businessFormationDefaults.addressStateLabel}</Content>
                    <StateDropdown
                      fieldName="agentOfficeAddressState"
                      value={"New Jersey"}
                      placeholder={Config.businessFormationDefaults.addressModalStatePlaceholder}
                      validationText={Config.businessFormationDefaults.addressStateErrorText}
                      disabled={true}
                      onSelect={() => {}}
                      className={"margin-top-2"}
                    />
                  </WithErrorBar>
                </div>
                <div className="grid-col-7 tablet:grid-col-4">
                  <BusinessFormationTextField
                    errorBarType="NEVER"
                    numericProps={{ maxLength: 5 }}
                    fieldName="agentOfficeAddressZipCode"
                    label={Config.businessFormationDefaults.registeredAgentZipCodeLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentZipCodePlaceholder}
                    validationText={Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText}
                    inlineErrorStyling={true}
                    required={true}
                    disabled={shouldBeDisabled("agentOfficeAddressZipCode", "ADDRESS")}
                  />
                </div>
              </WithErrorBar>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
