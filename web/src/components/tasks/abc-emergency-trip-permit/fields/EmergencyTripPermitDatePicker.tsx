import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import {
  DateObject,
  defaultDateFormat,
  EmergencyTripPermitUserEnteredFieldNames,
  getEarliestPermitDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { FieldStateActionKind } from "@businessnjgovnavigator/shared/types";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: EmergencyTripPermitUserEnteredFieldNames;
}

export const EmergencyTripPermitDatePicker = (props: Props): ReactElement => {
  const dateFormat = "MM/DD/YYYY";
  const context = useContext(EmergencyTripPermitContext);
  const dataFormErrorContext = useContext(DataFormErrorMapContext);

  const getMinDate = (): dayjs.Dayjs => {
    return getEarliestPermitDate();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        minDate={getMinDate()}
        maxDate={getMinDate()?.add(4, "days")}
        value={
          context.state.applicationInfo.permitDate
            ? parseDateWithFormat(context.state.applicationInfo.permitDate, defaultDateFormat)
            : getMinDate()
        }
        inputFormat={dateFormat}
        onChange={(newValue: DateObject | null): void => {
          if (newValue) {
            const newApplicationInfo = {
              ...context.state.applicationInfo,
              [props.fieldName]: newValue.format(defaultDateFormat),
            };
            context.setApplicationInfo(newApplicationInfo);

            if (
              context.state.applicationInfo.permitStartTime &&
              context.state.applicationInfo.permitStartTime !== ""
            ) {
              dataFormErrorContext.reducer({
                type: FieldStateActionKind.VALIDATION,
                payload: {
                  field: "permitStartTime",
                  invalid: getErrorStateForEmergencyTripPermitField(
                    "permitStartTime",
                    newApplicationInfo,
                  ).hasError,
                },
              });
            }
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
                  "aria-label": camelCaseToSentence(props.fieldName),
                }}
              />
            </div>
          );
        }}
      />
    </LocalizationProvider>
  );
};
