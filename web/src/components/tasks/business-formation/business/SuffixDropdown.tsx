import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { BusinessSuffix, BusinessSuffixMap, FormationLegalType } from "@businessnjgovnavigator/shared/";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { FocusEvent, ReactElement, useContext } from "react";

export const SuffixDropdown = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

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
      <div className="flex margin-bottom-2">
        <Content>{Config.businessFormationDefaults.businessSuffixLabel}</Content>
      </div>
      <div className="margin-bottom-2">
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
            {BusinessSuffixMap[userData?.profileData.legalStructureId as FormationLegalType].map((suffix) => (
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
