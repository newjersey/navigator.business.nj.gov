import { Content } from "@/components/Content";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useMountEffect } from "@/lib/utils/helpers";
import { DatePicker, LocalizationProvider } from "@mui/lab";
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
      setFormationFormData({
        ...state.formationFormData,
        businessStartDate: dayjs().format("YYYY-MM-DD"),
      });
      setShowError(false);
    }
  });

  const handleChange = (value: string) => {
    setFormationFormData({
      ...state.formationFormData,
      businessStartDate: value,
    });
  };

  return (
    <div className="margin-bottom-2">
      <Content key="dateOfFormationMd">{state.displayContent.businessStartDate.contentMd}</Content>
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify ">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            minDate={dayjs()}
            maxDate={dayjs().add(100, "years")}
            value={dayjs(state.formationFormData.businessStartDate, "YYYY-MM-DD")}
            inputFormat={"MM/DD/YYYY"}
            onChange={(newValue: Dayjs | null): void => {
              if (newValue) {
                handleChange(newValue.format("YYYY-MM-DD"));
              }
            }}
            onError={(hasError: string | null) => {
              setShowError(!!hasError);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                helperText={showError ? BusinessFormationDefaults.startDateErrorText : " "}
                inputProps={{
                  ...params.inputProps,
                  "data-testid": "date-textfield",
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};
