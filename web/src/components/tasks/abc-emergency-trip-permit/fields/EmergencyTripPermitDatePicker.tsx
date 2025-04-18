import { getErrorStateForEmergencyTripPermitField } from "@/components/tasks/abc-emergency-trip-permit/fields/getErrorStateForEmergencyTripPermitField";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { FieldStateActionKind } from "@/lib/types/types";
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
  const dataFormErrorContext = useContext(DataFormErrorMapContext);

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
                  invalid: getErrorStateForEmergencyTripPermitField("permitStartTime", newApplicationInfo)
                    .hasError,
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
