import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationFields, FormationTextField, InFormInBylaws } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

type InFormBylawsRadioType = Exclude<InFormInBylaws, undefined>;
type TrueFalseRadioType = "true" | "false";

export const NonprofitProvisions = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const isInForm = (hasBoardMembers: boolean | undefined, fieldName: InFormInBylaws): boolean => {
    if (hasBoardMembers) {
      return hasBoardMembers && fieldName === "IN_FORM";
    } else {
      return false;
    }
  };

  const getTextField = (fieldName: FormationTextField): ReactNode => {
    return (
      <div className="margin-top-1">
        <div className="grid-row">
          <div className="grid-col">
            <BusinessFormationTextField
              fieldName={fieldName}
              required={true}
              errorBarType="ALWAYS"
              validationText={Config.formation.general.genericErrorText}
              label={Config.formation.nonprofitProvisions.description}
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
          {Config.formation.general.charactersLabel}
        </div>
      </div>
    );
  };

  const getRadioLabel = (value: InFormBylawsRadioType | TrueFalseRadioType): string => {
    const labelMap = {
      true: Config.formation.nonprofitProvisions.radioYesText,
      false: Config.formation.nonprofitProvisions.radioNoText,
      IN_FORM: Config.formation.nonprofitProvisions.radioInFormText,
      IN_BYLAWS: Config.formation.nonprofitProvisions.radioInBylawsText,
    };

    return labelMap[value];
  };

  const getRadio = ({
    fieldName,
    title,
    values,
  }: {
    fieldName: FormationFields;
    title: string;
    values: InFormBylawsRadioType[] | TrueFalseRadioType[];
  }): ReactNode => {
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
              const value = e.target.value;
              const valueToSave = value === "true" || value === "false" ? JSON.parse(value) : value;
              setFormationFormData({
                ...state.formationFormData,
                [fieldName]: valueToSave,
              });
              setFieldsInteracted([fieldName]);
            }}
            row
          >
            {values.map((value) => (
              <FormControlLabel
                key={`${fieldName}-${value}`}
                style={{ alignItems: "center" }}
                value={value}
                control={
                  <Radio
                    required={true}
                    data-testid={`${fieldName}-${value}`}
                    color={hasError ? "error" : "primary"}
                  />
                }
                label={getRadioLabel(value)}
              />
            ))}
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
          {Config.formation.nonprofitProvisions.label}
        </div>
      </div>

      {getRadio({
        fieldName: "hasNonprofitBoardMembers",
        title: Config.formation.fields.hasNonprofitBoardMembers.body,
        values: ["true", "false"],
      })}

      {state.formationFormData.hasNonprofitBoardMembers &&
        getRadio({
          fieldName: "nonprofitBoardMemberQualificationsSpecified",
          title: Config.formation.fields.nonprofitBoardMemberQualificationsSpecified.body,
          values: ["IN_BYLAWS", "IN_FORM"],
        })}
      {isInForm(
        state.formationFormData.hasNonprofitBoardMembers,
        state.formationFormData.nonprofitBoardMemberQualificationsSpecified
      ) && getTextField("nonprofitBoardMemberQualificationsTerms")}

      {state.formationFormData.hasNonprofitBoardMembers &&
        getRadio({
          fieldName: "nonprofitBoardMemberRightsSpecified",
          title: Config.formation.fields.nonprofitBoardMemberRightsSpecified.body,
          values: ["IN_BYLAWS", "IN_FORM"],
        })}
      {isInForm(
        state.formationFormData.hasNonprofitBoardMembers,
        state.formationFormData.nonprofitBoardMemberRightsSpecified
      ) && getTextField("nonprofitBoardMemberRightsTerms")}

      {state.formationFormData.hasNonprofitBoardMembers &&
        getRadio({
          fieldName: "nonprofitTrusteesMethodSpecified",
          title: Config.formation.fields.nonprofitTrusteesMethodSpecified.body,
          values: ["IN_BYLAWS", "IN_FORM"],
        })}
      {isInForm(
        state.formationFormData.hasNonprofitBoardMembers,
        state.formationFormData.nonprofitTrusteesMethodSpecified
      ) && getTextField("nonprofitTrusteesMethodTerms")}

      {state.formationFormData.hasNonprofitBoardMembers &&
        getRadio({
          fieldName: "nonprofitAssetDistributionSpecified",
          title: Config.formation.fields.nonprofitAssetDistributionSpecified.body,
          values: ["IN_BYLAWS", "IN_FORM"],
        })}
      {isInForm(
        state.formationFormData.hasNonprofitBoardMembers,
        state.formationFormData.nonprofitAssetDistributionSpecified
      ) && getTextField("nonprofitAssetDistributionTerms")}
    </>
  );
};
