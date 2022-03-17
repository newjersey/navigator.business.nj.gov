import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { useMountEffect } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { TextField } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import React, { ReactElement, useContext, useState } from "react";
dayjs.extend(advancedFormat);

export const BusinessStartDate = (): ReactElement => {
  const [showError, setShowError] = useState<boolean>(false);

  const { state, setFormationFormData } = useContext(FormationContext);

  useMountEffect(() => {
    if (!state.formationFormData.businessStartDate) {
      setShowError(false);
    }
  });

  const handleChange = (value: string) => {
    setFormationFormData({
      ...state.formationFormData,
      businessStartDate: value,
    });
  };

  const Picker = process.env.NODE_ENV === "test" ? DesktopDatePicker : DatePicker;

  return (
    <>
      <div className="flex">
        <Content key="dateOfFormationMd">{Config.businessFormationDefaults.businessStartDateLabel}</Content>
        <ArrowTooltip title={Config.businessFormationDefaults.businessStartDateTooltip}>
          <div className="fdr fac margin-left-05" data-testid="automatic-status-info-tooltip">
            <Icon>help_outline</Icon>
          </div>
        </ArrowTooltip>
      </div>
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Picker
            minDate={dayjs()}
            maxDate={dayjs().add(100, "years")}
            value={dayjs(state.formationFormData.businessStartDate, "YYYY-MM-DD")}
            inputFormat={"MM/DD/YYYY"}
            onChange={(newValue: Dayjs | null): void => {
              if (newValue) handleChange(newValue.format("YYYY-MM-DD"));
              if (newValue === null) handleChange("");
            }}
            onError={(hasError: string | null) => {
              setShowError(!!hasError);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                helperText={showError ? Config.businessFormationDefaults.startDateErrorText : " "}
                inputProps={{
                  ...params.inputProps,
                  "aria-label": "Business start date",
                  "data-testid": "date-textfield",
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>
    </>
  );
};
