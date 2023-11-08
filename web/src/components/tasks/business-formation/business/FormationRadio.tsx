import { Content } from "@/components/Content";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationFields, InFormInBylaws } from "@businessnjgovnavigator/shared/formationData";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {useMountEffect} from "@/lib/utils/helpers";

type InFormBylawsRadioType = Exclude<InFormInBylaws, undefined>;
type TrueFalseRadioType = "true" | "false";

interface Props {
  fieldName: FormationFields;
  title: string;
  values: InFormBylawsRadioType[] | TrueFalseRadioType[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string | undefined;
  overrideLabelMap?: Record<InFormBylawsRadioType, string> | Record<TrueFalseRadioType, string>;
}

export const FormationRadio = (props: Props): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const { isFormFieldInvalid, RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(props.fieldName, FormationFormContext);
  const errorMessage = props.errorMessage ?? Config.formation.general.genericErrorText;

  RegisterForOnSubmit(() => isValid(state.formationFormData[props.fieldName]));

  const isValid = (value: unknown): boolean => {
    return value !== undefined
  };

  const runValidation = (value: unknown): void => setIsValid(isValid(value));

  useMountEffect(() => {
    runValidation(state.formationFormData[props.fieldName])
  })

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
    <WithErrorBar className="margin-top-2" hasError={isFormFieldInvalid} type="ALWAYS">
      <strong>
        <Content>{props.title}</Content>
      </strong>
      <FormationField fieldName={props.fieldName}>
        <FormControl error={isFormFieldInvalid}>
          <RadioGroup
            aria-label={camelCaseToSentence(props.fieldName)}
            name={camelCaseToSentence(props.fieldName)}
            value={state.formationFormData[props.fieldName]?.toString() ?? ""}
            onChange={(e) => {
              setIsValid(true)
              props.onChange(e)
            }}
            row
          >
            {props.values.map((value) => (
              <FormControlLabel
                key={`${props.fieldName}-${value}`}
                style={{ alignItems: "center" }}
                value={value}
                control={
                  <Radio data-testid={`${props.fieldName}-${value}`} color={isFormFieldInvalid ? "error" : "primary"} />
                }
                label={getRadioLabel(value)}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{isFormFieldInvalid ? errorMessage : ""}</FormHelperText>
        </FormControl>
      </FormationField>
    </WithErrorBar>
  );
};
