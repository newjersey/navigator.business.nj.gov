import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props {
  hasError: boolean;
}

export const PracticesLaw = (props: Props): ReactElement => {
  const { hasError } = props;
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

  const onChange = (value: "true" | "false"): void => {
    const willPracticeLaw = JSON.parse(value);
    setFormationFormData((previousState) => {
      return {
        ...previousState,
        willPracticeLaw,
      };
    });
  };

  return (
    <FormControl variant="outlined" fullWidth className="padding-bottom-2">
      <RadioGroup
        aria-label={camelCaseToSentence(Config.formation.fields.willPracticeLaw.label)}
        className="fac"
        key={`${state.formationFormData.willPracticeLaw}-key`}
        value={state.formationFormData.willPracticeLaw}
        onChange={(e): void => onChange(e.target.value as "true" | "false")}
        row
      >
        <label className="margin-right-3">{Config.formation.fields.willPracticeLaw.label}</label>
        <FormControlLabel
          labelPlacement="end"
          data-testid={"practice-law-yes"}
          value={"true"}
          control={<Radio color="primary" />}
          label={
            <div className="padding-y-1 margin-right-3">
              {Config.formation.fields.willPracticeLaw.radioYesText}
            </div>
          }
        />
        <FormControlLabel
          labelPlacement="end"
          data-testid={"practice-law-no"}
          value={"false"}
          control={<Radio color="primary" />}
          label={
            <div className="padding-y-1 margin-right-3">
              {Config.formation.fields.willPracticeLaw.radioNoText}
            </div>
          }
        />
      </RadioGroup>
      {hasError && (
        <FormHelperText className={"text-error-dark"}>
          {Config.formation.fields.willPracticeLaw.error}
        </FormHelperText>
      )}
    </FormControl>
  );
};
