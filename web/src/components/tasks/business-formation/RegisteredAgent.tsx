import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { validateEmail, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

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

        <div className="margin-top-3">
          {state.formationFormData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <BusinessFormationTextField
                numericProps={{
                  minLength: 4,
                  maxLength: 7,
                }}
                fieldName={"agentNumber"}
                validationText={Config.businessFormationDefaults.agentNumberErrorText}
              />
            </div>
          )}

          {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <BusinessFormationTextField
                required={true}
                validationText={Config.businessFormationDefaults.agentnameErrorText}
                fieldName="agentName"
              />
              <BusinessFormationTextField
                fieldName="agentEmail"
                additionalValidation={validateEmail}
                required={true}
                validationText={Config.businessFormationDefaults.agentEmailErrorText}
              />
              <BusinessFormationTextField
                fieldName="agentOfficeAddressLine1"
                required={true}
                validationText={Config.businessFormationDefaults.agentOfficeAddressLine1ErrorText}
              />
              <BusinessFormationTextField fieldName="agentOfficeAddressLine2" />
              <div className="grid-row grid-gap-2">
                <div className="grid-col-12 tablet:grid-col-6">
                  <BusinessFormationTextField
                    fieldName="agentOfficeAddressCity"
                    required={true}
                    validationText={Config.businessFormationDefaults.agentOfficeaddressCityErrorText}
                  />
                </div>
                <div className="grid-col-5 tablet:grid-col-2">
                  <BusinessFormationTextField fieldName="agentOfficeAddressState" disabled={true} />
                </div>
                <div className="grid-col-7 tablet:grid-col-4">
                  <BusinessFormationTextField
                    numericProps={{
                      maxLength: 5,
                    }}
                    fieldName={"agentOfficeAddressZipCode"}
                    validationText={Config.businessFormationDefaults.agentOfficeAddressZipCodeErrorText}
                    additionalValidation={zipCodeRange}
                    required={true}
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
