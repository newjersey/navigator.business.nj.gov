import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useMountEffect } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  advancedDateLibrary,
  DateObject,
  getCurrentDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared/";
import { TextField } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactElement, useContext } from "react";
advancedDateLibrary();

export const FormationStartDate = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);

  useMountEffect(() => {
    if (!state.formationFormData.businessStartDate) {
      setErrorMap({ ...state.errorMap, businessStartDate: { invalid: true } });
    }
  });

  const handleChange = (value: string) => {
    setErrorMap({ ...state.errorMap, businessStartDate: { invalid: !value } });
    setFormationFormData({
      ...state.formationFormData,
      businessStartDate: value,
    });
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;

  return (
    <>
      <div className="flex margin-bottom-2">
        <Content key="dateOfFormationMd">{Config.businessFormationDefaults.businessStartDateLabel}</Content>
      </div>
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Picker
            minDate={getCurrentDate()}
            maxDate={getCurrentDate().add(100, "years")}
            value={parseDateWithFormat(state.formationFormData.businessStartDate, "YYYY-MM-DD")}
            inputFormat={"MM/DD/YYYY"}
            onChange={(newValue: DateObject | null): void => {
              if (newValue) handleChange(newValue.format("YYYY-MM-DD"));
              if (newValue === null) handleChange("");
            }}
            onError={(hasError: string | null) => {
              setErrorMap({ ...state.errorMap, businessStartDate: { invalid: !!hasError } });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                helperText={
                  state.errorMap["businessStartDate"].invalid
                    ? Config.businessFormationDefaults.startDateErrorText
                    : " "
                }
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
