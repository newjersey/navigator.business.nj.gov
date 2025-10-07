import { FormControl, MenuItem, Select } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { employerRatesQuarterObject } from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";

interface Props {
  dropdownOptions: employerRatesQuarterObject[];
  quarter: employerRatesQuarterObject;
  setQuarter: (quarter: employerRatesQuarterObject) => void;
}

export const EmployerRatesQuarterDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div className="text-field-width-reduced margin-y-2">
      <div className="fdr fac">
        <Content>{Config.employerRates.quarterDropdownLabelText}</Content>
        <div className="margin-left-05">
          <ArrowTooltip title={Config.employerRates.quarterDropdownTooltipText}>
            <div className="fdr fac font-body-lg">
              <Icon iconName="help_outline" />
            </div>
          </ArrowTooltip>
        </div>
      </div>
      <FormControl fullWidth variant="outlined">
        <Select
          fullWidth
          value={props.quarter.label}
          onChange={(event): void => {
            const selection = props.dropdownOptions.find(
              (option) => option.label === event.target.value,
            ) as employerRatesQuarterObject;
            props.setQuarter(selection);
          }}
          renderValue={(selected): ReactNode => selected}
        >
          {props.dropdownOptions.map(({ label }) => {
            return (
              <MenuItem key={label} value={label}>
                {label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};
