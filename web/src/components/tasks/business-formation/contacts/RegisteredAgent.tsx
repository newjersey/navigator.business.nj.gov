import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { Heading } from "@/components/njwds-extended/Heading";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { Checkbox, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";

export const RegisteredAgent = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const { doesFieldHaveError, getFieldErrorLabel, doSomeFieldsHaveError } = useFormationErrors();
  useEffect(
    function setAgentCheckboxFalseWhenAddressChanged() {
      const {
        agentUseBusinessAddress,
        agentOfficeAddressLine1,
        agentOfficeAddressLine2,
        agentOfficeAddressZipCode,
        agentOfficeAddressCity,
        addressLine1,
        addressLine2,
        addressMunicipality,
        addressZipCode,
      } = state.formationFormData;

      if (
        agentUseBusinessAddress &&
        (agentOfficeAddressLine1 !== addressLine1 ||
          agentOfficeAddressLine2 !== addressLine2 ||
          agentOfficeAddressCity !== addressMunicipality?.displayName ||
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
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ],
      { setToUninteracted: true }
    );
  };

  const handleRadioSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    resetAgentFieldsInteraction();
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        agentNumberOrManual: event.target.value as "NUMBER" | "MANUAL_ENTRY",
      };
    });
  };

  const toggleUseAccountInfo = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

  const toggleUseBusinessAddress = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    if (checked) {
      setFormationFormData({
        ...state.formationFormData,
        agentOfficeAddressLine1: state.formationFormData.addressLine1,
        agentOfficeAddressLine2: state.formationFormData.addressLine2,
        agentOfficeAddressCity: state.formationFormData.addressMunicipality?.displayName || "",
        agentOfficeAddressZipCode: state.formationFormData.addressZipCode,
        agentUseBusinessAddress: checked,
      });
      setFieldsInteracted([
        "agentOfficeAddressLine1",
        "agentOfficeAddressLine2",
        "agentOfficeAddressCity",
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
      <Heading level={2} styleVariant={"h3"}>
        {Config.formation.registeredAgent.label}
      </Heading>
      <Content>{Config.formation.registeredAgent.sectionDescription}</Content>
      <div id="registeredAgent">
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Registered Agent"
            name="registered-agent"
            value={state.formationFormData.agentNumberOrManual}
            onChange={handleRadioSelection}
          >
            <FormControlLabel
              labelPlacement="end"
              style={{ alignItems: "center" }}
              data-testid="registered-agent-number"
              value="NUMBER"
              control={<Radio color="primary" />}
              label={Config.formation.registeredAgent.radioButtonNumberText}
            />
            <FormControlLabel
              labelPlacement="end"
              data-testid="registered-agent-manual"
              style={{ alignItems: "center" }}
              value="MANUAL_ENTRY"
              control={<Radio color="primary" />}
              label={Config.formation.registeredAgent.radioButtonManualText}
            />
          </RadioGroup>
        </FormControl>
        <div className="margin-top-2">
          {state.formationFormData.agentNumberOrManual === "NUMBER" && (
            <div data-testid="agent-number">
              <FormationField fieldName="agentNumber">
                <BusinessFormationTextField
                  label={Config.formation.fields.agentNumber.label}
                  numericProps={{ minLength: 4, maxLength: 7 }}
                  fieldName="agentNumber"
                  required={true}
                  validationText={Config.formation.fields.agentNumber.error}
                  errorBarType="ALWAYS"
                />
              </FormationField>
            </div>
          )}

          {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
            <div data-testid="agent-name">
              <div className="margin-top-3 margin-bottom-1">
                <FormControlLabel
                  label={Config.formation.registeredAgent.sameContactCheckbox}
                  control={
                    <Checkbox
                      checked={state.formationFormData.agentUseAccountInfo}
                      onChange={toggleUseAccountInfo}
                      id="same-agent-info-as-account-checkbox"
                    />
                  }
                />
              </div>
              <WithErrorBar hasError={doSomeFieldsHaveError(["agentName", "agentEmail"])} type="DESKTOP-ONLY">
                <div className="grid-row grid-gap-1 margin-bottom-2">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <FormationField fieldName="agentName">
                      <BusinessFormationTextField
                        label={Config.formation.fields.agentName.label}
                        required={true}
                        validationText={getFieldErrorLabel("agentName")}
                        errorBarType="MOBILE-ONLY"
                        fieldName="agentName"
                        disabled={shouldBeDisabled("agentName", "ACCOUNT")}
                      />
                    </FormationField>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                    <FormationField fieldName="agentEmail">
                      <BusinessFormationTextField
                        label={Config.formation.fields.agentEmail.label}
                        fieldName="agentEmail"
                        errorBarType="MOBILE-ONLY"
                        required={true}
                        validationText={getFieldErrorLabel("agentEmail")}
                        disabled={shouldBeDisabled("agentEmail", "ACCOUNT")}
                      />
                    </FormationField>
                  </div>
                </div>
              </WithErrorBar>
              {state.formationFormData.businessLocationType === "NJ" && (
                <div className="margin-bottom-1">
                  <FormControlLabel
                    label={Config.formation.registeredAgent.sameAddressCheckbox}
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
              <FormationField fieldName="agentOfficeAddressLine1">
                <BusinessFormationTextField
                  label={Config.formation.fields.agentOfficeAddressLine1.label}
                  fieldName="agentOfficeAddressLine1"
                  required={true}
                  validationText={getFieldErrorLabel("agentOfficeAddressLine1")}
                  disabled={shouldBeDisabled("agentOfficeAddressLine1", "ADDRESS")}
                  errorBarType="ALWAYS"
                />
              </FormationField>
              <FormationField fieldName="agentOfficeAddressLine2">
                <BusinessFormationTextField
                  label={Config.formation.fields.agentOfficeAddressLine2.label}
                  fieldName="agentOfficeAddressLine2"
                  validationText={getFieldErrorLabel("agentOfficeAddressLine2")}
                  disabled={state.formationFormData.agentUseBusinessAddress}
                  errorBarType="ALWAYS"
                  className={"margin-top-2"}
                />
              </FormationField>
              <WithErrorBar
                type="DESKTOP-ONLY"
                hasError={doSomeFieldsHaveError(["agentOfficeAddressCity", "agentOfficeAddressZipCode"])}
              >
                <div className="grid-row grid-gap-1 margin-top-2">
                  <div className="grid-col-12 tablet:grid-col-6">
                    <WithErrorBar hasError={doesFieldHaveError("agentOfficeAddressCity")} type="MOBILE-ONLY">
                      <FormationField fieldName="agentOfficeAddressCity">
                        <BusinessFormationTextField
                          label={Config.formation.fields.agentOfficeAddressCity.label}
                          fieldName="agentOfficeAddressCity"
                          required={true}
                          validationText={getFieldErrorLabel("agentOfficeAddressCity")}
                          disabled={shouldBeDisabled("agentOfficeAddressCity", "ADDRESS")}
                          errorBarType="NEVER"
                        />
                      </FormationField>
                    </WithErrorBar>
                  </div>
                  <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                    <WithErrorBar
                      hasError={doesFieldHaveError("agentOfficeAddressZipCode")}
                      type="MOBILE-ONLY"
                    >
                      <div className="grid-row grid-gap-1">
                        <div className="grid-col-5">
                          <strong>
                            <ModifiedContent>
                              {Config.formation.fields.agentOfficeAddressState.label}
                            </ModifiedContent>
                          </strong>
                          <FormationField fieldName="agentOfficeAddressState">
                            <StateDropdown
                              fieldName="agentOfficeAddressState"
                              value="New Jersey"
                              validationText={Config.formation.fields.agentOfficeAddressState.error}
                              disabled={true}
                              onSelect={(): void => {}}
                            />
                          </FormationField>
                        </div>
                        <div className="grid-col-7">
                          <FormationField fieldName="agentOfficeAddressZipCode">
                            <BusinessFormationTextField
                              errorBarType="NEVER"
                              numericProps={{ maxLength: 5 }}
                              fieldName="agentOfficeAddressZipCode"
                              label={Config.formation.fields.agentOfficeAddressZipCode.label}
                              validationText={Config.formation.fields.agentOfficeAddressZipCode.error}
                              required={true}
                              disabled={shouldBeDisabled("agentOfficeAddressZipCode", "ADDRESS")}
                            />
                          </FormationField>
                        </div>
                      </div>
                    </WithErrorBar>
                  </div>
                </div>
              </WithErrorBar>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
