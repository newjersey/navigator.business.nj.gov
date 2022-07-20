import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationFields } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const PartnershipRights = (): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

  const getTextField = (fieldName: FormationFields) => (
    <div className="margin-top-1" style={{ maxWidth: "41em" }}>
      <Content>{Config.businessFormationDefaults.partnershipRightsTermsLabel}</Content>
      <div className="grid-row">
        <div className="grid-col">
          <GenericTextField
            value={state.formationFormData[fieldName] as string}
            placeholder={Config.businessFormationDefaults.partnershipRightsTermsPlaceholder}
            handleChange={(value) =>
              setFormationFormData({
                ...state.formationFormData,
                [fieldName]: value,
              })
            }
            fieldName={fieldName}
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
  const getRadio = (fieldName: FormationFields) => (
    <FormControl>
      <RadioGroup
        aria-label={camelCaseToSentence(fieldName)}
        name={camelCaseToSentence(fieldName)}
        value={state.formationFormData[fieldName]?.toString() ?? ""}
        onChange={(e) =>
          setFormationFormData({
            ...state.formationFormData,
            [fieldName]: JSON.parse(e.target.value),
          })
        }
        row
      >
        <FormControlLabel
          style={{ marginTop: ".75rem", alignItems: "flex-start" }}
          value={"true"}
          control={<Radio color="primary" sx={{ paddingTop: "0px" }} data-testid={`${fieldName}-true`} />}
          label={Config.businessFormationDefaults.partnershipRightsRadioYesText}
        />
        <FormControlLabel
          style={{ marginTop: ".75rem", alignItems: "flex-start" }}
          value={"false"}
          control={<Radio color="primary" sx={{ paddingTop: "0px" }} data-testid={`${fieldName}-false`} />}
          label={Config.businessFormationDefaults.partnershipRightsRadioNoText}
        />
      </RadioGroup>
    </FormControl>
  );
  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.businessFormationDefaults.partnershipRightsTitle}
        </div>
      </div>
      <Content className="margin-top-2">
        {Config.businessFormationDefaults.partnershipRightsCanAssignRights}
      </Content>
      {getRadio("canCreateLimitedPartner")}
      {state.formationFormData.canCreateLimitedPartner && getTextField("createLimitedPartnerTerms")}
      <Content className="margin-top-3">
        {Config.businessFormationDefaults.partnershipRightsCanReceiveDistributions}
      </Content>
      {getRadio("canGetDistribution")}
      {state.formationFormData.canGetDistribution && getTextField("getDistributionTerms")}
      <Content className="margin-top-3">
        {Config.businessFormationDefaults.partnershipRightsCanMakeDistributions}
      </Content>
      {getRadio("canMakeDistribution")}
      {state.formationFormData.canMakeDistribution && getTextField("makeDistributionTerms")}
    </>
  );
};
