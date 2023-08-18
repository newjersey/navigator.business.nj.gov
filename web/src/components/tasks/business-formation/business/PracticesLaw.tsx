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

  return (
    <FormControl variant="outlined" fullWidth>
      <RadioGroup
        aria-label={camelCaseToSentence(Config.formation.fields.willPracticeLaw.label)}
        className="fac"
        key={`${state.formationFormData.willPracticeLaw}-key`}
        value={state.formationFormData.willPracticeLaw}
        onChange={(e): void =>
          setFormationFormData((previousState) => {
            return {
              ...previousState,
              willPracticeLaw: JSON.parse(e.target.value)
            };
          })
        }
        row
      >
        <label className="margin-right-3" data-testid="will-practice-law-label">
          {Config.formation.fields.willPracticeLaw.label}
        </label>
        <FormControlLabel
          labelPlacement="end"
          data-testid={"practice-law-yes"}
          value={true}
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
          value={false}
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
