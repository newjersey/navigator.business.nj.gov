import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { BusinessSuffix, BusinessSuffixMap } from "@businessnjgovnavigator/shared/";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, useContext } from "react";

export const SuffixDropdown = (): ReactElement => {
  const FIELD = "businessSuffix";
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessSuffix: event.target.value as BusinessSuffix,
      };
    });
  };

  return (
    <>
      <div className="flex margin-bottom-2">
        <Content>{Config.businessFormationDefaults.businessSuffixLabel}</Content>
      </div>
      <div className="margin-bottom-2">
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
            onBlur={() => {
              setFieldsInteracted([FIELD]);
            }}
            inputProps={{ "data-testid": "business-suffix" }}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <span className="text-base">
                    {Config.businessFormationDefaults.businessSuffixPlaceholder}
                  </span>
                );
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
          <FormHelperText>
            {doesFieldHaveError(FIELD) ? Config.businessFormationDefaults.suffixErrorText : " "}
          </FormHelperText>
        </FormControl>
      </div>
    </>
  );
};
