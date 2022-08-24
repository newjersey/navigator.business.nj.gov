import { Content } from "@/components/Content";
import { BusinessFormationFieldAlert } from "@/components/tasks/business-formation/BusinessFormationFieldAlert";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFields, FormationTextField } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const PartnershipRights = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);

  const getTextField = (fieldName: FormationTextField) => (
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

  const getRadio = (fieldName: FormationFields, title: string) => (
    <div
      className={state.errorMap[fieldName].invalid ? `input-error-bar error margin-top-2` : "input-error-bar"}
    >
      <Content>{title}</Content>
      <FormControl error={state.errorMap[fieldName].invalid}>
        <RadioGroup
          aria-label={camelCaseToSentence(fieldName)}
          name={camelCaseToSentence(fieldName)}
          value={state.formationFormData[fieldName]?.toString() ?? ""}
          onChange={(e) => {
            setFormationFormData({
              ...state.formationFormData,
              [fieldName]: JSON.parse(e.target.value),
            });
            setErrorMap({ ...state.errorMap, [fieldName]: { invalid: !e.target.value } });
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
                color={state.errorMap[fieldName].invalid ? "error" : "primary"}
                sx={{
                  paddingTop: "0px",
                }}
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
                color={state.errorMap[fieldName].invalid ? "error" : "primary"}
                sx={{
                  paddingTop: "0px",
                }}
                data-testid={`${fieldName}-false`}
              />
            }
            label={Config.businessFormationDefaults.partnershipRightsRadioNoText}
          />
        </RadioGroup>
        <FormHelperText>
          {state.errorMap[fieldName].invalid ? Config.businessFormationDefaults.genericErrorText : ""}
        </FormHelperText>
      </FormControl>
    </div>
  );
  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.businessFormationDefaults.partnershipRightsTitle}
        </div>
      </div>
      <BusinessFormationFieldAlert
        fields={["canCreateLimitedPartner", "canMakeDistribution", "canGetDistribution"]}
      />
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
