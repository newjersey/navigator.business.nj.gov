import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationFields, FormationTextField } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

export const PartnershipRights = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const getTextField = (fieldName: FormationTextField): ReactNode => {
    return (
      <div className="margin-top-1">
        <BusinessFormationTextField
          fieldName={fieldName}
          required={true}
          errorBarType="ALWAYS"
          validationText={Config.formation.general.genericErrorText}
          label={Config.formation.partnershipRights.description}
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
        <div className="text-base-dark margin-top-1 margin-bottom-2">
          {(state.formationFormData[fieldName] as string)?.length ?? 0} / {400}{" "}
          {Config.formation.general.charactersLabel}
        </div>
      </div>
    );
  };

  const getRadio = (fieldName: FormationFields, title: string): ReactNode => {
    const hasError = doesFieldHaveError(fieldName);
    return (
      <WithErrorBar className="margin-top-2" hasError={hasError} type="ALWAYS">
        <Content>{title}</Content>
        <FormControl error={hasError}>
          <RadioGroup
            aria-label={camelCaseToSentence(fieldName)}
            name={camelCaseToSentence(fieldName)}
            value={state.formationFormData[fieldName]?.toString() ?? ""}
            onChange={(e): void => {
              setFormationFormData({
                ...state.formationFormData,
                [fieldName]: JSON.parse(e.target.value),
              });
              setFieldsInteracted([fieldName]);
            }}
            row
          >
            <FormControlLabel
              style={{ alignItems: "center" }}
              value={"true"}
              control={
                <Radio
                  required={true}
                  data-testid={`${fieldName}-true`}
                  color={hasError ? "error" : "primary"}
                />
              }
              label={Config.formation.partnershipRights.radioYesText}
            />
            <FormControlLabel
              style={{ alignItems: "center" }}
              value={"false"}
              control={
                <Radio
                  required={true}
                  color={hasError ? "error" : "primary"}
                  data-testid={`${fieldName}-false`}
                />
              }
              label={Config.formation.partnershipRights.radioNoText}
            />
          </RadioGroup>
          <FormHelperText>{hasError ? Config.formation.general.genericErrorText : ""}</FormHelperText>
        </FormControl>
      </WithErrorBar>
    );
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.formation.partnershipRights.label}
        </div>
      </div>

      {getRadio("canCreateLimitedPartner", Config.formation.fields.canCreateLimitedPartner.body)}
      {state.formationFormData.canCreateLimitedPartner && getTextField("createLimitedPartnerTerms")}

      {getRadio("canGetDistribution", Config.formation.fields.canGetDistribution.body)}
      {state.formationFormData.canGetDistribution && getTextField("getDistributionTerms")}

      {getRadio("canMakeDistribution", Config.formation.fields.canMakeDistribution.body)}
      {state.formationFormData.canMakeDistribution && getTextField("makeDistributionTerms")}
    </>
  );
};
