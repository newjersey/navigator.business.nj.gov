import { Content } from "@/components/Content";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import { FormationTextField } from "@businessnjgovnavigator/shared";
import { TextField, TextFieldProps } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useContext, useRef } from "react";

interface Props {
  fieldName: FormationTextField;
  fieldOptions?: TextFieldProps;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  visualFilter?: (value: string) => string;
  valueFilter?: (value: string) => string;
  handleChange?: () => void;
  error?: boolean;
  validationText?: string;
  disabled?: boolean;
}

export const BusinessFormationTextField = (props: Props): ReactElement => {
  const { state, setFormationData } = useContext(FormationContext);

  const inputRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    const value = props.valueFilter ? props.valueFilter(event.target.value) : event.target.value;
    const formationData = { ...state.formationData };
    formationData[props.fieldName] = value;
    setFormationData({ ...formationData });
  };

  const value = props.visualFilter
    ? props.visualFilter((state.formationData[props.fieldName] as string) ?? "")
    : state.formationData[props.fieldName];

  return (
    <div ref={inputRef}>
      <Content>{state.displayContent[props.fieldName].contentMd}</Content>
      <TextField
        value={value ?? ""}
        id={props.fieldName}
        onChange={handleChange}
        onBlur={props.onValidation}
        onSubmit={props.onValidation}
        error={props.error}
        helperText={props.error ? props.validationText ?? " " : " "}
        variant="outlined"
        fullWidth
        placeholder={state.displayContent[props.fieldName].placeholder ?? ""}
        disabled={props.disabled}
        {...props.fieldOptions}
        inputProps={{
          "aria-label": camelCaseToSentence(props.fieldName),
          ...props.fieldOptions?.inputProps,
        }}
      />
    </div>
  );
};
