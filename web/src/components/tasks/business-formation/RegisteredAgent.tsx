import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);
  const { userData } = useUserData();
  const [useAccountInfo, setUseAccountInfo] = useState<boolean>(false);
  const [useBusinessAddress, setUseBusinessAddress] = useState<boolean>(false);

  useEffect(() => {
    if (
      useBusinessAddress &&
      (state.formationFormData.agentOfficeAddressLine1 !== state.formationFormData.businessAddressLine1 ||
        state.formationFormData.agentOfficeAddressLine2 !== state.formationFormData.businessAddressLine2 ||
        state.formationFormData.agentOfficeAddressZipCode !== state.formationFormData.businessAddressZipCode)
    ) {
      setUseBusinessAddress(false);
    }
  }, [
    state.formationFormData.agentOfficeAddressLine1,
    state.formationFormData.agentOfficeAddressLine2,
    state.formationFormData.agentOfficeAddressZipCode,
    state.formationFormData.businessAddressLine1,
    state.formationFormData.businessAddressLine2,
    state.formationFormData.businessAddressZipCode,
    useBusinessAddress,
  ]);

  const resetAgentFieldsInErrorMap = (): void => {
    setErrorMap({
      ...state.errorMap,
      agentNumberOrManual: { invalid: false },
      agentNumber: { invalid: false },
      agentName: { invalid: false },
      agentEmail: { invalid: false },
      agentOfficeAddressLine1: { invalid: false },
      agentOfficeAddressLine2: { invalid: false },
      agentOfficeAddressCity: { invalid: false },
      agentOfficeAddressState: { invalid: false },
      agentOfficeAddressZipCode: { invalid: false },
    });
  };

  const handleRadioSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    resetAgentFieldsInErrorMap();
    setFormationFormData({
      ...state.formationFormData,
      agentNumberOrManual: event.target.value as "NUMBER" | "MANUAL_ENTRY",
    });
  };

  const toggleUseAccountInfo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setUseAccountInfo(checked);
    if (checked) {
      setFormationFormData({
        ...state.formationFormData,
        agentName: userData?.user.name ?? "",
        agentEmail: userData?.user.email ?? "",
      });
      setErrorMap({
        ...state.errorMap,
        agentName: { invalid: false },
        agentEmail: { invalid: false },
      });
    }
  };

  const toggleUseBusinessAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setUseBusinessAddress(checked);
    if (checked) {
      setFormationFormData({
        ...state.formationFormData,
        agentOfficeAddressLine1: state.formationFormData.businessAddressLine1,
        agentOfficeAddressLine2: state.formationFormData.businessAddressLine2,
        agentOfficeAddressCity: userData?.profileData.municipality?.name ?? "",
        agentOfficeAddressState: state.formationFormData.businessAddressState,
        agentOfficeAddressZipCode: state.formationFormData.businessAddressZipCode,
      });
      setErrorMap({
        ...state.errorMap,
        agentOfficeAddressLine1: { invalid: false },
        agentOfficeAddressLine2: { invalid: false },
        agentOfficeAddressCity: { invalid: false },
        agentOfficeAddressState: { invalid: false },
        agentOfficeAddressZipCode: { invalid: false },
      });
    }
  };

  return (
    <>
      <Content>{state.displayContent.agentNumberOrManual.contentMd}</Content>
      <div className="form-input margin-bottom-2 margin-top-105" id="registeredAgent">
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
              data-testid="registered-agent-number"
              value="NUMBER"
              control={<Radio color="primary" />}
              label={state.displayContent.agentNumberOrManual.radioButtonNumberText}
            />
            <FormControlLabel
              labelPlacement="end"
              data-testid="registered-agent-manual"
              value="MANUAL_ENTRY"
              control={<Radio color="primary" />}
              label={state.displayContent.agentNumberOrManual.radioButtonManualText}
            />
          </RadioGroup>
        </FormControl>

        <div className="margin-top-1">
          {state.formationFormData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentNumberLabel}
                placeholder={Config.businessFormationDefaults.registeredAgentNumberPlaceholder}
                numericProps={{
                  minLength: 4,
                  maxLength: 7,
                }}
                fieldName="agentNumber"
                validationText={Config.businessFormationDefaults.agentNumberErrorText}
              />
            </div>
          )}

          {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <div className="margin-bottom-1">
                <FormControlLabel
                  label={Config.businessFormationDefaults.sameAgentInfoAsAccount}
                  control={<Checkbox checked={useAccountInfo} onChange={toggleUseAccountInfo} />}
                />
              </div>
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentNameLabel}
                placeholder={Config.businessFormationDefaults.registeredAgentNamePlaceholder}
                required={true}
                validationText={Config.businessFormationDefaults.agentnameErrorText}
                fieldName="agentName"
                disabled={useAccountInfo}
              />
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentEmailLabel}
                placeholder={Config.businessFormationDefaults.registeredAgentEmailPlaceholder}
                fieldName="agentEmail"
                additionalValidation={validateEmail}
                required={true}
                validationText={Config.businessFormationDefaults.agentEmailErrorText}
                disabled={useAccountInfo}
              />
              <div className="margin-bottom-1">
                <FormControlLabel
                  label={Config.businessFormationDefaults.sameAgentAddressAsBusiness}
                  control={<Checkbox checked={useBusinessAddress} onChange={toggleUseBusinessAddress} />}
                />
              </div>
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine1Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine1Placeholder}
                fieldName="agentOfficeAddressLine1"
                required={true}
                validationText={Config.businessFormationDefaults.agentOfficeAddressLine1ErrorText}
                disabled={useBusinessAddress}
              />
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.registeredAgentAddressLine2Label}
                placeholder={Config.businessFormationDefaults.registeredAgentAddressLine2Placeholder}
                fieldName="agentOfficeAddressLine2"
                disabled={useBusinessAddress}
              />
              <div className="grid-row grid-gap-2">
                <div className="grid-col-12 tablet:grid-col-6">
                  <BusinessFormationTextField
                    label={Config.businessFormationDefaults.registeredAgentCityLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentCityPlaceholder}
                    fieldName="agentOfficeAddressCity"
                    required={true}
                    validationText={Config.businessFormationDefaults.agentOfficeaddressCityErrorText}
                    disabled={useBusinessAddress}
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
                    numericProps={{
                      maxLength: 5,
                    }}
                    fieldName="agentOfficeAddressZipCode"
                    label={Config.businessFormationDefaults.registeredAgentZipCodeLabel}
                    placeholder={Config.businessFormationDefaults.registeredAgentZipCodePlaceholder}
                    validationText={Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText}
                    additionalValidation={zipCodeRange}
                    required={true}
                    disabled={useBusinessAddress}
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
