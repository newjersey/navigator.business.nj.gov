import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { DateObject, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import {
  EmergencyTripPermitFieldNames,
  getEarliestPermitDate,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { TextField } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: EmergencyTripPermitFieldNames;
}

export const EmergencyTripPermitDatePicker = (props: Props): ReactElement => {
  const dateFormat = "MM/DD/YYYY";
  const context = useContext(EmergencyTripPermitContext);

  const getMinDate = (): dayjs.Dayjs => {
    return getEarliestPermitDate();
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Picker
        minDate={getMinDate()}
        maxDate={getMinDate()?.add(5, "days")}
        value={
          context.state.applicationInfo.permitDate
            ? parseDateWithFormat(context.state.applicationInfo.permitDate ?? getMinDate(), defaultDateFormat)
            : getMinDate()
        }
        inputFormat={dateFormat}
        onChange={(newValue: DateObject | null): void => {
          console.log(newValue);
          if (newValue) {
            context.setApplicationInfo({
              ...context.state.applicationInfo,
              [props.fieldName]: newValue.format(defaultDateFormat),
            });
          }
          if (newValue === null) {
            context.setApplicationInfo({
              ...context.state.applicationInfo,
              [props.fieldName]: "",
            });
          }
        }}
        renderInput={(params): JSX.Element => {
          return (
            <div className="width-100">
              <TextField
                {...params}
                variant="outlined"
                error={false}
                sx={{
                  svg: { fill: "#4b7600" },
                }}
                inputProps={{
                  ...params.inputProps,
                  placeholder: "",
                  "aria-label": camelCaseToSentence(props.fieldName),
                  "data-testid": `date-${props.fieldName}`,
                }}
              />
            </div>
          );
        }}
      />
    </LocalizationProvider>
  );
};
