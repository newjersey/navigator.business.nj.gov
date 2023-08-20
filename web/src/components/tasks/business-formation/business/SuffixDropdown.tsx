import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { BusinessSuffix, BusinessSuffixMap } from "@businessnjgovnavigator/shared/";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

export const SuffixDropdown = (): ReactElement => {
  const FIELD = "businessSuffix";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (event: SelectChangeEvent<string>): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessSuffix: event.target.value as BusinessSuffix,
      };
    });
  };

  return (
    <>
      <div className="flex">
        <strong>
          <ContextualInfoButton
            text={Config.formation.fields.businessSuffix.label}
            id={Config.formation.fields.businessSuffix.labelContextualInfo}
          />
        </strong>
      </div>
      <FormControl fullWidth error={doesFieldHaveError(FIELD)}>
        <InputLabel id="business-suffix-label" className="visibility-hidden">
          {camelCaseToSentence("businessSuffix")}
        </InputLabel>
        <Select
          autoComplete="no"
          labelId="business-suffix-label"
          id="business-suffix"
          displayEmpty
          value={state.formationFormData.businessSuffix || ""}
          onChange={handleChange}
          onBlur={(): void => setFieldsInteracted([FIELD])}
          inputProps={{ "data-testid": "business-suffix" }}
          renderValue={(selected): ReactNode => {
            if (selected.length === 0) {
              return <></>;
            }

            return selected;
          }}
        >
          {BusinessSuffixMap[state.formationFormData.legalType].map((suffix) => {
            return (
              <MenuItem key={suffix} value={suffix} data-testid={suffix}>
                {suffix}
              </MenuItem>
            );
          })}
        </Select>
        {doesFieldHaveError(FIELD) && (
          <FormHelperText>{Config.formation.fields.businessSuffix.error}</FormHelperText>
        )}
      </FormControl>
    </>
  );
};
