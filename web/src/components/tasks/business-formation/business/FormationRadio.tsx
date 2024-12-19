import { Content } from "@/components/Content";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationFields, InFormInBylaws } from "@businessnjgovnavigator/shared/formationData";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";

type InFormBylawsRadioType = Exclude<InFormInBylaws, undefined>;
type TrueFalseRadioType = "true" | "false";

interface Props {
  fieldName: FormationFields;
  title: string;
  subtitle?: string;
  values: InFormBylawsRadioType[] | TrueFalseRadioType[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string | undefined;
  overrideLabelMap?: Record<InFormBylawsRadioType, string> | Record<TrueFalseRadioType, string>;
}

export const FormationRadio = (props: Props): ReactElement<any> => {
  const { doesFieldHaveError } = useFormationErrors();
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const hasError = doesFieldHaveError(props.fieldName);
  const errorMessage = props.errorMessage ?? Config.formation.general.genericErrorText;

  const getRadioLabel = (value: InFormBylawsRadioType | TrueFalseRadioType): string => {
    const labelMap = {
      true: Config.formation.general.radioYesText,
      false: Config.formation.general.radioNoText,
      IN_FORM: Config.formation.nonprofitProvisions.radioInFormText,
      IN_BYLAWS: Config.formation.nonprofitProvisions.radioInBylawsText,
      ...props.overrideLabelMap,
    };

    return labelMap[value];
  };

  return (
    <WithErrorBar className="margin-top-2" hasError={hasError} type="ALWAYS">
      <strong>
        <Content>{props.title}</Content>
      </strong>
      {props.subtitle && (
        <div className="margin-y-05">
          <Content>{props.subtitle}</Content>
        </div>
      )}
      <FormationField fieldName={props.fieldName}>
        <FormControl error={hasError}>
          <RadioGroup
            aria-label={camelCaseToSentence(props.fieldName)}
            name={camelCaseToSentence(props.fieldName)}
            value={state.formationFormData[props.fieldName]?.toString() ?? ""}
            onChange={props.onChange}
            row
          >
            {props.values.map((value) => (
              <FormControlLabel
                key={`${props.fieldName}-${value}`}
                style={{ alignItems: "center" }}
                value={value}
                control={
                  <Radio data-testid={`${props.fieldName}-${value}`} color={hasError ? "error" : "primary"} />
                }
                label={getRadioLabel(value)}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{hasError ? errorMessage : ""}</FormHelperText>
        </FormControl>
      </FormationField>
    </WithErrorBar>
  );
};
