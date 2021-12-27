import { Content } from "@/components/Content";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import { AllBusinessSuffixes, BusinessSuffix } from "@businessnjgovnavigator/shared";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";

export const BusinessSuffixDropdown = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setErrorMap({ ...state.errorMap, businessSuffix: { invalid: false } });
    setFormationFormData({
      ...state.formationFormData,
      businessSuffix: event.target.value as BusinessSuffix,
    });
  };

  return (
    <>
      <Content>{state.displayContent.businessSuffix.contentMd}</Content>
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
            inputProps={{ "data-testid": "business-suffix" }}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <div className="text-disabled-dark">{state.displayContent.businessSuffix.placeholder}</div>
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
            {state.errorMap.businessSuffix.invalid ? BusinessFormationDefaults.suffixErrorText : " "}
          </FormHelperText>
        </FormControl>
      </div>
    </>
  );
};
