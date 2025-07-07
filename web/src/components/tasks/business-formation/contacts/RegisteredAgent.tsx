import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { Callout } from "@/components/njwds-extended/callout/Callout";
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
import React, { ReactElement, useContext } from "react";

const RegisteredAgentInfoCallout = (): ReactElement => {
  const { Config } = useConfig();
  return (
    <Callout
      calloutType="informational"
      showHeader={true}
      headerText={Config.formation.registeredAgent.infoCalloutHeading}
    >
      <div>
        <p>{Config.formation.registeredAgent.infoCalloutIntro}</p>
        <ul>
          {Config.formation.registeredAgent.infoCalloutBullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
        <p>{Config.formation.registeredAgent.infoCalloutFooter}</p>
      </div>
    </Callout>
  );
};

const RegisteredAgentManualEntryFields = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError, getFieldErrorLabel, doSomeFieldsHaveError } = useFormationErrors();

  const shouldBeDisabled = (field: FormationFields, type: "ACCOUNT" | "ADDRESS"): boolean => {
    const isCorrespondingCheckboxChecked =
      type === "ACCOUNT"
        ? state.formationFormData.agentUseAccountInfo
        : state.formationFormData.agentUseBusinessAddress;
    const hasValue = !!state.formationFormData[field];

    if (type === "ACCOUNT" && (field === "agentName" || field === "agentEmail")) {
      return false;
    }

    return isCorrespondingCheckboxChecked && hasValue;
  };

  const toggleUseBusinessAddress = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    if (checked) {
      setFormationFormData((previousFormationData) => ({
        ...previousFormationData,
        agentOfficeAddressLine1: previousFormationData.addressLine1,
        agentOfficeAddressLine2: previousFormationData.addressLine2,
        agentOfficeAddressCity: previousFormationData.addressMunicipality?.name || "",
        agentOfficeAddressZipCode: previousFormationData.addressZipCode,
        agentUseBusinessAddress: checked,
      }));
      setFieldsInteracted([
        "agentOfficeAddressLine1",
        "agentOfficeAddressLine2",
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ]);
    } else {
      setFormationFormData((previousFormationData) => ({
        ...previousFormationData,
        agentUseBusinessAddress: checked,
      }));
    }
  };

  const getAriaLiveRegion = (): ReactElement | undefined => {
    const interactedWithAgentCheckbox =
      state.interactedFields.includes("agentEmail") && state.interactedFields.includes("agentName");
    if (interactedWithAgentCheckbox && !state.formationFormData.agentUseAccountInfo) {
      return (
        <div>{`${Config.formation.registeredAgent.checkboxCheckedScreenReaderAnnouncement}`}</div>
      );
    }

    if (interactedWithAgentCheckbox && state.formationFormData.agentUseAccountInfo) {
      return (
        <div>{`${Config.formation.registeredAgent.checkboxUnCheckedScreenReaderAnnouncement}`}</div>
      );
    }
  };

  return (
    <>
      <div aria-live="polite" className="screen-reader-only">
        {getAriaLiveRegion()}
      </div>

      <WithErrorBar
        hasError={doSomeFieldsHaveError(["agentName", "agentEmail"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1 margin-bottom-2">
          <div className="grid-col-12 tablet:grid-col-6">
            <FormationField fieldName="agentName">
              <BusinessFormationTextField
                label={Config.formation.fields.agentName.label}
                required={true}
                validationText={getFieldErrorLabel("agentName")}
                errorBarType="MOBILE-ONLY"
                fieldName="agentName"
                readOnly={shouldBeDisabled("agentName", "ACCOUNT")}
                type="text"
                inputProps={{ id: "agent-name-id" }}
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
                readOnly={shouldBeDisabled("agentEmail", "ACCOUNT")}
                type="text"
                inputProps={{ id: "agent-email-id" }}
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
            <WithErrorBar
              hasError={doesFieldHaveError("agentOfficeAddressCity")}
              type="MOBILE-ONLY"
            >
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
    </>
  );
};

export const RegisteredAgent = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const resetAgentFieldsInteraction = (): void => {
    setFieldsInteracted(
      [
        "agentType",
        "agentNumber",
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressLine2",
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ],
      { setToUninteracted: true },
    );
  };

  const handleRadioSelection = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ): void => {
    const selectedAgentType = event.target.value as
      | "MYSELF"
      | "AUTHORIZED_REP"
      | "PROFESSIONAL_SERVICE";

    resetAgentFieldsInteraction();
    setFormationFormData((previousFormationData) => {
      const data = {
        ...previousFormationData,
        agentType: selectedAgentType,
      };

      if (selectedAgentType === "MYSELF" && userData?.user?.name && userData?.user?.email) {
        return {
          ...data,
          agentName: userData.user.name,
          agentEmail: userData.user.email,
          agentUseAccountInfo: true,
        };
      } else {
        return {
          ...data,
          agentName: "",
          agentEmail: "",
          agentUseAccountInfo: false,
        };
      }
    });
  };

  return (
    <>
      <Heading level={2} styleVariant={"h3"}>
        {Config.formation.registeredAgent.label}
      </Heading>
      <Content className="margin-bottom-2">
        {Config.formation.registeredAgent.sectionDescription}
      </Content>
      <div id="registeredAgent">
        <Heading level={4} className="margin-bottom-2">
          {Config.formation.registeredAgent.whoToListSubheading}
        </Heading>
        <FormControl fullWidth>
          <RadioGroup
            aria-label="Registered Agent"
            name="registered-agent"
            value={state.formationFormData.agentType}
            onChange={handleRadioSelection}
          >
            <FormControlLabel
              labelPlacement="end"
              style={{ alignItems: "center" }}
              data-testid="registered-agent-myself"
              value="MYSELF"
              control={<Radio color="primary" />}
              label={Config.formation.registeredAgent.radioButtonMyselfText}
            />
            <FormControlLabel
              labelPlacement="end"
              style={{ alignItems: "center" }}
              data-testid="registered-agent-authorized-rep"
              value="AUTHORIZED_REP"
              control={<Radio color="primary" />}
              label={Config.formation.registeredAgent.radioButtonAuthorizedRepText}
            />
            <FormControlLabel
              labelPlacement="end"
              data-testid="registered-agent-professional-service"
              style={{ alignItems: "center" }}
              value="PROFESSIONAL_SERVICE"
              control={<Radio color="primary" />}
              label={Config.formation.registeredAgent.radioButtonProfessionalServiceText}
            />
          </RadioGroup>
        </FormControl>
        <div className="margin-top-2">
          {state.formationFormData.agentType === "MYSELF" && (
            <div data-testid="agent-myself">
              <RegisteredAgentInfoCallout />
              <RegisteredAgentManualEntryFields />
            </div>
          )}

          {state.formationFormData.agentType === "AUTHORIZED_REP" && (
            <div data-testid="agent-authorized-rep">
              <RegisteredAgentInfoCallout />
              <RegisteredAgentManualEntryFields />
            </div>
          )}

          {state.formationFormData.agentType === "PROFESSIONAL_SERVICE" && (
            <div data-testid="agent-professional-service">
              <div className="margin-top-3">
                <FormationField fieldName="agentNumber">
                  <BusinessFormationTextField
                    label={Config.formation.registeredAgent.agentNumberLabel}
                    secondaryLabel={Config.formation.registeredAgent.agentNumberLabelSecondary}
                    numericProps={{ minLength: 4, maxLength: 7 }}
                    fieldName="agentNumber"
                    required={true}
                    validationText={Config.formation.fields.agentNumber.error}
                    errorBarType="ALWAYS"
                    disabled={state.formationFormData.showManualEntry}
                  />
                </FormationField>
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.formationFormData.showManualEntry}
                    onChange={(e) =>
                      setFormationFormData({
                        ...state.formationFormData,
                        showManualEntry: e.target.checked,
                      })
                    }
                    id="manual-entry-checkbox"
                  />
                }
                label={Config.formation.registeredAgent.manualEntryCheckboxLabel}
              />
              {state.formationFormData.showManualEntry && (
                <>
                  <div className="margin-top-3">
                    <RegisteredAgentManualEntryFields />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
