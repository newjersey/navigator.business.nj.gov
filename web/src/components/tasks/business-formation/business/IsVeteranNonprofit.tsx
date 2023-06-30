import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const IsVeteranNonprofit = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const fieldName = "isVeteranNonprofit";
  const { doesFieldHaveError } = useFormationErrors();
  const hasError = doesFieldHaveError(fieldName);

  return (
    <WithErrorBar hasError={hasError} type="ALWAYS">
      <FormControl variant="outlined" fullWidth className="padding-bottom-2">
        <label className="margin-right-3 text-bold">
          <Content>{Config.formation.fields.isVeteranNonprofit.description}</Content>
        </label>
        <RadioGroup
          aria-label={camelCaseToSentence(fieldName)}
          className="fac"
          value={state.formationFormData.isVeteranNonprofit ?? ""}
          onChange={(e): void =>
            setFormationFormData((previousState) => {
              return {
                ...previousState,
                isVeteranNonprofit: JSON.parse(e.target.value),
              };
            })
          }
          row
        >
          <FormControlLabel
            labelPlacement="end"
            data-testid={"is-veteran-nonprofit-yes"}
            value={true}
            control={<Radio color="primary" />}
            label={
              <div className="padding-y-1 margin-right-3">
                {Config.formation.fields.isVeteranNonprofit.radioYesText}
              </div>
            }
          />
          <FormControlLabel
            labelPlacement="end"
            data-testid={"is-veteran-nonprofit-no"}
            value={false}
            control={<Radio color="primary" />}
            label={
              <div className="padding-y-1 margin-right-3">
                {Config.formation.fields.isVeteranNonprofit.radioNoText}
              </div>
            }
          />
        </RadioGroup>
        {hasError && (
          <FormHelperText className={"text-error-dark"}>
            {Config.formation.fields.isVeteranNonprofit.error}
          </FormHelperText>
        )}
      </FormControl>
    </WithErrorBar>
  );
};
