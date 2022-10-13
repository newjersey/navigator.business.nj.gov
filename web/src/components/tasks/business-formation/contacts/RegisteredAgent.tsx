import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { Checkbox, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { state, setFormationFormData, setFieldInteracted } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  useEffect(
    function setAgentCheckboxFalseWhenAddressChanged() {
      const {
        agentUseBusinessAddress,
        agentOfficeAddressLine1,
        agentOfficeAddressLine2,
        agentOfficeAddressZipCode,
        businessAddressLine1,
        businessAddressLine2,
        businessAddressZipCode,
      } = state.formationFormData;

      if (
        agentUseBusinessAddress &&
        (agentOfficeAddressLine1 !== businessAddressLine1 ||
          agentOfficeAddressLine2 !== businessAddressLine2 ||
          agentOfficeAddressZipCode !== businessAddressZipCode)
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
    setFieldInteracted("agentNumberOrManual", { setToUninteracted: true });
    setFieldInteracted("agentNumber", { setToUninteracted: true });
    setFieldInteracted("agentName", { setToUninteracted: true });
    setFieldInteracted("agentEmail", { setToUninteracted: true });
    setFieldInteracted("agentOfficeAddressLine1", { setToUninteracted: true });
    setFieldInteracted("agentOfficeAddressLine2", { setToUninteracted: true });
    setFieldInteracted("agentOfficeAddressCity", { setToUninteracted: true });
    setFieldInteracted("agentOfficeAddressState", { setToUninteracted: true });
    setFieldInteracted("agentOfficeAddressZipCode", { setToUninteracted: true });
  };

  const handleRadioSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    resetAgentFieldsInteraction();
    setFormationFormData({
      ...state.formationFormData,
      agentNumberOrManual: event.target.value as "NUMBER" | "MANUAL_ENTRY",
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
      setFieldInteracted("agentName");
      setFieldInteracted("agentEmail");
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
        agentOfficeAddressLine1: state.formationFormData.businessAddressLine1,
        agentOfficeAddressLine2: state.formationFormData.businessAddressLine2,
        agentOfficeAddressCity: userData?.profileData.municipality?.name ?? "",
        agentOfficeAddressState: state.formationFormData.businessAddressState,
        agentOfficeAddressZipCode: state.formationFormData.businessAddressZipCode,
        agentUseBusinessAddress: checked,
      });
      setFieldInteracted("agentOfficeAddressLine1");
      setFieldInteracted("agentOfficeAddressLine2");
      setFieldInteracted("agentOfficeAddressCity");
      setFieldInteracted("agentOfficeAddressState");
      setFieldInteracted("agentOfficeAddressZipCode");
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
              <div className="grid-row grid-gap-2">
                <div className="tablet:grid-col-6">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentNameLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentNamePlaceholder}
                    required={true}
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
                    inlineErrorStyling={true}
                    required={true}
                    validationText={Config.businessFormationDefaults.agentEmailErrorText}
                    disabled={shouldBeDisabled("agentEmail", "ACCOUNT")}
                    formInputFull
                  />
                </div>
              </div>
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
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine1Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine1Placeholder}
                fieldName="agentOfficeAddressLine1"
                required={true}
                validationText={Config.businessFormationDefaults.agentOfficeAddressLine1ErrorText}
                disabled={shouldBeDisabled("agentOfficeAddressLine1", "ADDRESS")}
                formInputFull
              />
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine2Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine2Placeholder}
                fieldName="agentOfficeAddressLine2"
                disabled={state.formationFormData.agentUseBusinessAddress}
                formInputFull
              />
              <div className="grid-row grid-gap-2 margin-top-2">
                <div className="grid-col-12 tablet:grid-col-6">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentCityLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentCityPlaceholder}
                    fieldName="agentOfficeAddressCity"
                    required={true}
                    validationText={Config.businessFormationDefaults.agentOfficeAddressCityErrorText}
                    disabled={shouldBeDisabled("agentOfficeAddressCity", "ADDRESS")}
                    formInputFull
                  />
                </div>
                <div className="grid-col-5 tablet:grid-col-2">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentStateLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentStatePlaceholder}
                    fieldName="agentOfficeAddressState"
                    disabled={true}
                  />
                </div>
                <div className="grid-col-7 tablet:grid-col-4">
                  <BusinessFormationTextField
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
