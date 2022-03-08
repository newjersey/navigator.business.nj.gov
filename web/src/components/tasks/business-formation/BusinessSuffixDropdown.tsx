import { Content } from "@/components/Content";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { AllBusinessSuffixes, BusinessSuffix } from "@businessnjgovnavigator/shared";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { FocusEvent, ReactElement, useContext } from "react";

export const BusinessSuffixDropdown = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setErrorMap({ ...state.errorMap, businessSuffix: { invalid: false } });
    setFormationFormData({
      ...state.formationFormData,
      businessSuffix: event.target.value as BusinessSuffix,
    });
  };

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessSuffix: { invalid: true } });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessSuffix: { invalid: false } });
    }
  };

  return (
    <>
      <Content>{Config.businessFormationDefaults.businessSuffixLabel}</Content>
      <div className="form-input margin-bottom-2">
        <FormControl fullWidth error={state.errorMap.businessSuffix.invalid}>
          <InputLabel id="business-suffix-label" className="visibility-hidden">
            {camelCaseToSentence("businessSuffix")}
          </InputLabel>
          <Select
            labelId="business-suffix-label"
            id="business-suffix"
            displayEmpty
            value={state.formationFormData.businessSuffix || ""}
            onChange={handleChange}
            onBlur={onValidation}
            inputProps={{ "data-testid": "business-suffix" }}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <div className="text-base">
                    {Config.businessFormationDefaults.businessSuffixPlaceholder}
                  </div>
                );
              }

              return selected;
            }}
          >
            {AllBusinessSuffixes.map((suffix) => (
              <MenuItem key={suffix} value={suffix} data-testid={suffix}>
                {suffix}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {state.errorMap.businessSuffix.invalid ? Config.businessFormationDefaults.suffixErrorText : " "}
          </FormHelperText>
        </FormControl>
      </div>
    </>
  );
};
