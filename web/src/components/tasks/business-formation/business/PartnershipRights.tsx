import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import { FormationFields, FormationTextField } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const PartnershipRights = (): ReactElement => {
  const { state, setFormationFormData, setFieldInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const { doesFieldHaveError, doSomeFieldsHaveError } = useFormationErrors();

  const getTextField = (fieldName: FormationTextField) => {
    return (
      <div className="margin-top-1">
        <div className="grid-row">
          <div className="grid-col">
            <BusinessFormationTextField
              placeholder={Config.businessFormationDefaults.partnershipRightsTermsPlaceholder}
              fieldName={fieldName}
              required={true}
              validationText={Config.businessFormationDefaults.genericErrorText}
              label={Config.businessFormationDefaults.partnershipRightsTermsLabel}
              formInputFull
              fieldOptions={{
                multiline: true,
                rows: 3,
                className: "override-padding",
                inputProps: {
                  maxLength: 400,
                  sx: {
                    padding: "1rem",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="text-base-dark margin-top-1 margin-bottom-2">
          {(state.formationFormData[fieldName] as string)?.length ?? 0} / {400}{" "}
          {Config.businessFormationDefaults.charactersLabel}
        </div>
      </div>
    );
  };

  const getRadio = (fieldName: FormationFields, title: string) => {
    const hasError = doesFieldHaveError(fieldName);
    return (
      <div className={hasError ? `input-error-bar error margin-top-2` : "input-error-bar"}>
        <Content>{title}</Content>
        <FormControl error={hasError} className={hasError ? `input-error-bar` : ""}>
          <RadioGroup
            aria-label={camelCaseToSentence(fieldName)}
            name={camelCaseToSentence(fieldName)}
            value={state.formationFormData[fieldName]?.toString() ?? ""}
            onChange={(e) => {
              setFormationFormData({
                ...state.formationFormData,
                [fieldName]: JSON.parse(e.target.value),
              });
              setFieldInteracted(fieldName);
            }}
            row
          >
            <FormControlLabel
              style={{ marginTop: ".75rem", alignItems: "flex-start" }}
              value={"true"}
              control={
                <Radio
                  required={true}
                  data-testid={`${fieldName}-true`}
                  color={hasError ? "error" : "primary"}
                  sx={{ paddingTop: "0px" }}
                />
              }
              label={Config.businessFormationDefaults.partnershipRightsRadioYesText}
            />
            <FormControlLabel
              style={{ marginTop: ".75rem", alignItems: "flex-start" }}
              value={"false"}
              control={
                <Radio
                  required={true}
                  color={hasError ? "error" : "primary"}
                  sx={{ paddingTop: "0px" }}
                  data-testid={`${fieldName}-false`}
                />
              }
              label={Config.businessFormationDefaults.partnershipRightsRadioNoText}
            />
          </RadioGroup>
          <FormHelperText>{hasError ? Config.businessFormationDefaults.genericErrorText : ""}</FormHelperText>
        </FormControl>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.businessFormationDefaults.partnershipRightsTitle}
        </div>
      </div>
      {doSomeFieldsHaveError(["canCreateLimitedPartner", "canMakeDistribution", "canGetDistribution"]) && (
        <Alert variant="error">{Config.businessFormationDefaults.partnershipRightsRadioErrorText}</Alert>
      )}
      {getRadio("canCreateLimitedPartner", Config.businessFormationDefaults.partnershipRightsCanAssignRights)}
      {state.formationFormData.canCreateLimitedPartner && getTextField("createLimitedPartnerTerms")}
      {getRadio(
        "canGetDistribution",
        Config.businessFormationDefaults.partnershipRightsCanReceiveDistributions
      )}
      {state.formationFormData.canGetDistribution && getTextField("getDistributionTerms")}
      {getRadio(
        "canMakeDistribution",
        Config.businessFormationDefaults.partnershipRightsCanMakeDistributions
      )}
      {state.formationFormData.canMakeDistribution && getTextField("makeDistributionTerms")}
    </>
  );
};
