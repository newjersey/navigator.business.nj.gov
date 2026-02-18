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
import { ReactElement, useContext, ReactNode } from "react";

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
        enableAccessibleFieldDOMStructure={false}
        minDate={getMinDate()}
        maxDate={getMinDate()?.add(4, "days")}
        value={
          context.state.applicationInfo.permitDate
            ? parseDateWithFormat(context.state.applicationInfo.permitDate, defaultDateFormat)
            : getMinDate()
        }
        format={dateFormat}
        onChange={(newValue: unknown): void => {
          const dateObj = newValue as DateObject | null;
          if (dateObj) {
            const newApplicationInfo = {
              ...context.state.applicationInfo,
              [props.fieldName]: dateObj.format(defaultDateFormat),
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
          if (dateObj === null) {
            context.setApplicationInfo({
              ...context.state.applicationInfo,
              [props.fieldName]: "",
            });
          }
        }}
        slotProps={{
          textField: {
            variant: "outlined",
            error: false,
            sx: {
              svg: { fill: "#4b7600" },
            },
            inputProps: {
              "aria-label": camelCaseToSentence(props.fieldName),
            },
          },
        }}
        slots={{
          textField: (params): ReactNode => {
            return (
              <div className="width-100">
                <TextField {...params} />
              </div>
            );
          },
        }}
      />
    </LocalizationProvider>
  );
};
