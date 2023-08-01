import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationFields, FormationTextField, InFormInBylaws } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ChangeEvent, ReactElement, ReactNode, useContext } from "react";

type InFormBylawsRadioType = Exclude<InFormInBylaws, undefined>;
type TrueFalseRadioType = "true" | "false";

export const NonprofitProvisions = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const { doesFieldHaveError } = useFormationErrors();

  const hasBoardMembers = state.formationFormData.hasNonprofitBoardMembers;

  const isInForm = (fieldName: FormationFields): boolean => {
    return hasBoardMembers === true && state.formationFormData[fieldName] === "IN_FORM";
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
    onChange,
  }: {
    fieldName: FormationFields;
    title: string;
    values: InFormBylawsRadioType[] | TrueFalseRadioType[];
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
            onChange={onChange}
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

  const getBoardMembersRadio = (): ReactNode => {
    return getRadio({
      fieldName: "hasNonprofitBoardMembers",
      title: Config.formation.fields.hasNonprofitBoardMembers.body,
      values: ["true", "false"],
      onChange: (e): void => {
        const valueToSave = JSON.parse(e.target.value);
        setFormationFormData({
          ...state.formationFormData,
          hasNonprofitBoardMembers: valueToSave,
          nonprofitBoardMemberQualificationsSpecified: undefined,
          nonprofitBoardMemberQualificationsTerms: "",
          nonprofitBoardMemberRightsSpecified: undefined,
          nonprofitBoardMemberRightsTerms: "",
          nonprofitTrusteesMethodSpecified: undefined,
          nonprofitTrusteesMethodTerms: "",
          nonprofitAssetDistributionSpecified: undefined,
          nonprofitAssetDistributionTerms: "",
        });
        setFieldsInteracted(["hasNonprofitBoardMembers"]);
        setFieldsInteracted(
          [
            "nonprofitBoardMemberQualificationsSpecified",
            "nonprofitBoardMemberQualificationsTerms",
            "nonprofitBoardMemberRightsSpecified",
            "nonprofitBoardMemberRightsTerms",
            "nonprofitTrusteesMethodSpecified",
            "nonprofitTrusteesMethodTerms",
            "nonprofitAssetDistributionSpecified",
            "nonprofitAssetDistributionTerms",
          ],
          { setToUninteracted: true }
        );
      },
    });
  };

  const getFormBylawsRadio = (fieldName: FormationFields): ReactNode => {
    return getRadio({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: (Config.formation.fields as any)[fieldName].body,
      fieldName: fieldName,
      values: ["IN_BYLAWS", "IN_FORM"],
      onChange: (e): void => {
        const value = e.target.value;
        setFormationFormData({
          ...state.formationFormData,
          [fieldName]: value,
        });
        setFieldsInteracted([fieldName]);
      },
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-0-override">
          {Config.formation.nonprofitProvisions.label}
        </div>
      </div>

      {getBoardMembersRadio()}

      {hasBoardMembers && getFormBylawsRadio("nonprofitBoardMemberQualificationsSpecified")}
      {isInForm("nonprofitBoardMemberQualificationsSpecified") &&
        getTextField("nonprofitBoardMemberQualificationsTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitBoardMemberRightsSpecified")}
      {isInForm("nonprofitBoardMemberRightsSpecified") && getTextField("nonprofitBoardMemberRightsTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitTrusteesMethodSpecified")}
      {isInForm("nonprofitTrusteesMethodSpecified") && getTextField("nonprofitTrusteesMethodTerms")}

      {hasBoardMembers && getFormBylawsRadio("nonprofitAssetDistributionSpecified")}
      {isInForm("nonprofitAssetDistributionSpecified") && getTextField("nonprofitAssetDistributionTerms")}
    </>
  );
};
