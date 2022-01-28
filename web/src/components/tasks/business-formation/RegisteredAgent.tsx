import { Content } from "@/components/Content";
import { BusinessFormationNumericField } from "@/components/tasks/business-formation/BusinessFormationNumericField";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { validateEmail, zipCodeRange } from "@/lib/utils/helpers";
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
      <div className="form-input margin-bottom-2" id="registeredAgent">
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Registered Agent"
            name="registered-agent"
            value={state.formationFormData.agentNumberOrManual}
            onChange={handleRadioSelection}
            row
          >
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="registered-agent-number"
              value="NUMBER"
              control={<Radio color="primary" />}
              label={state.displayContent.agentNumberOrManual.radioButtonNumberText}
            />
            <FormControlLabel
              style={{ marginRight: "3rem" }}
              labelPlacement="end"
              data-testid="registered-agent-manual"
              value="MANUAL_ENTRY"
              control={<Radio color="primary" />}
              label={state.displayContent.agentNumberOrManual.radioButtonManualText}
            />
          </RadioGroup>
        </FormControl>

        <div className="margin-top-2">
          {state.formationFormData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <BusinessFormationNumericField
                minLength={4}
                maxLength={7}
                fieldName={"agentNumber"}
                validationText={BusinessFormationDefaults.agentNumberErrorText}
              />
            </div>
          )}

          {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <BusinessFormationTextField
                required={true}
                validationText={BusinessFormationDefaults.agentnameErrorText}
                fieldName="agentName"
              />
              <BusinessFormationTextField
                fieldName="agentEmail"
                additionalValidation={validateEmail}
                required={true}
                validationText={BusinessFormationDefaults.agentEmailErrorText}
              />
              <BusinessFormationTextField
                fieldName="agentOfficeAddressLine1"
                required={true}
                validationText={BusinessFormationDefaults.agentOfficeAddressLine1ErrorText}
              />
              <BusinessFormationTextField fieldName="agentOfficeAddressLine2" />
              <div className="grid-row grid-gap-1">
                <div className="desktop:grid-col-5">
                  <BusinessFormationTextField
                    fieldName="agentOfficeAddressCity"
                    required={true}
                    validationText={BusinessFormationDefaults.agentOfficeaddressCityErrorText}
                  />
                </div>
                <div className="desktop:grid-col-2">
                  <BusinessFormationTextField fieldName="agentOfficeAddressState" disabled={true} />
                </div>
                <div className="desktop:grid-col-5">
                  <BusinessFormationNumericField
                    minLength={5}
                    maxLength={5}
                    fieldName={"agentOfficeAddressZipCode"}
                    validationText={BusinessFormationDefaults.agentOfficeaddressZipCodeErrorText}
                    additionalValidation={zipCodeRange}
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
