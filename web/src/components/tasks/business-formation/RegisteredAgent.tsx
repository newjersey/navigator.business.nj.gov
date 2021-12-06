import { Content } from "@/components/Content";
import { BusinessFormationNumericField } from "@/components/tasks/business-formation/BusinessFormationNumericField";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { FocusEvent, ReactElement, useContext, useState } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { state, setFormationData } = useContext(FormationContext);
  const [errorMap, setErrorMap] = useState<Partial<Record<FormationTextField, boolean>>>({});

  const handleRadioSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setErrorMap({});
    setFormationData({
      ...state.formationData,
      agentNumberOrManual: event.target.value as "NUMBER" | "MANUAL_ENTRY",
    });
  };

  const onValidation = (
    event: FocusEvent<HTMLInputElement>,
    field: FormationTextField,
    radioValueNeeded: "NUMBER" | "MANUAL_ENTRY"
  ) => {
    if (state.formationData.agentNumberOrManual !== radioValueNeeded) {
      setErrorMap({ ...errorMap, [field]: false });
    } else if (!event.target.value.trim()) {
      setErrorMap({ ...errorMap, [field]: true });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...errorMap, [field]: false });
    }
  };

  return (
    <>
      <Content>{state.displayContent.agentNumberOrManual.contentMd}</Content>
      <div className="form-input margin-bottom-2">
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Registered Agent"
            name="registered-agent"
            value={state.formationData.agentNumberOrManual}
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
          {state.formationData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <BusinessFormationTextField
                error={errorMap["agentNumber"]}
                onValidation={(event) => onValidation(event, "agentNumber", "NUMBER")}
                validationText={BusinessFormationDefaults.agentNumberErrorText}
                fieldName="agentNumber"
              />
            </div>
          )}

          {state.formationData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <BusinessFormationTextField
                error={errorMap["agentName"]}
                onValidation={(event) => onValidation(event, "agentName", "MANUAL_ENTRY")}
                validationText={BusinessFormationDefaults.agentNameErrorText}
                fieldName="agentName"
              />
              <BusinessFormationTextField
                fieldName="agentEmail"
                error={errorMap["agentEmail"]}
                onValidation={(event) => onValidation(event, "agentEmail", "MANUAL_ENTRY")}
                validationText={BusinessFormationDefaults.agentEmailErrorText}
              />
              <BusinessFormationTextField
                fieldName="agentOfficeAddressLine1"
                error={errorMap["agentOfficeAddressLine1"]}
                onValidation={(event) => onValidation(event, "agentOfficeAddressLine1", "MANUAL_ENTRY")}
                validationText={BusinessFormationDefaults.agentOfficeAddressLine1ErrorText}
              />
              <BusinessFormationTextField fieldName="agentOfficeAddressLine2" />
              <div className="grid-row grid-gap-1">
                <div className="desktop:grid-col-5">
                  <BusinessFormationTextField
                    fieldName="agentOfficeAddressCity"
                    error={errorMap["agentOfficeAddressCity"]}
                    onValidation={(event) => onValidation(event, "agentOfficeAddressCity", "MANUAL_ENTRY")}
                    validationText={BusinessFormationDefaults.agentOfficeAddressCityErrorText}
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
                    validationText={BusinessFormationDefaults.businessAddressZipCode}
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
