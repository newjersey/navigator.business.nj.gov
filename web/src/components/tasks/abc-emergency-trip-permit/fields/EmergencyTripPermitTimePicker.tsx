import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { getCurrentDateInNewJersey } from "@businessnjgovnavigator/shared/dateHelpers";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { Autocomplete, TextField } from "@mui/material";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { ChangeEvent, ReactElement, useContext, useState } from "react";

interface Props {
  fieldName: EmergencyTripPermitFieldNames;
  allDay?: boolean;
}

interface FormattedTime {
  displayTime: string;
  internalTime: string;
}

const generateAllTimesWithHalfHourIncrement = (
  startHour: number,
  startAtZeroMinutes: boolean
): FormattedTime[] => {
  const times: FormattedTime[] = [];
  for (let hour = startHour; hour < 24; hour++) {
    if (startAtZeroMinutes) {
      const dateTime = dayjs().hour(hour).minute(0);
      times.push({
        displayTime: dateTime.format("hh:mm a"),
        internalTime: dateTime.format("HH:mm"),
      });
    }
    const dateTimeThirty = dayjs().hour(hour).minute(30);
    times.push({
      displayTime: dateTimeThirty.format("hh:mm a"),
      internalTime: dateTimeThirty.format("HH:mm"),
    });
  }
  return times;
};

const getFormattedTimeFromInternalTime = (value: string): FormattedTime | null => {
  if (value === "") {
    return null;
  }
  const timeParts = value.split(":");
  return {
    displayTime: dayjs().hour(Number(timeParts[0])).minute(Number(timeParts[1])).format("hh:mm a"),
    internalTime: value,
  };
};

export const EmergencyTripPermitTimePicker = (props: Props): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const context = useContext(EmergencyTripPermitContext);
  dayjs.extend(timezone);

  const getStartHour = (): number => {
    if (props.allDay) {
      return 0;
    }
    return getCurrentDateInNewJersey().hour();
  };

  const shouldStartMinutesAtZero = (): boolean => {
    return getCurrentDateInNewJersey().minute() < 30;
  };

  const options = generateAllTimesWithHalfHourIncrement(getStartHour(), shouldStartMinutesAtZero());
  const handleChange = (event: ChangeEvent<unknown>, value: FormattedTime | null): void => {
    context.setApplicationInfo({
      ...context.state.applicationInfo,
      [props.fieldName]: value?.internalTime,
    });
  };

  return (
    <Autocomplete
      options={options}
      value={getFormattedTimeFromInternalTime(context.state.applicationInfo.permitStartTime)}
      getOptionLabel={(option: FormattedTime): string => {
        return option.displayTime;
      }}
      isOptionEqualToValue={(option: FormattedTime, value: FormattedTime): boolean => {
        return option.internalTime === value.internalTime;
      }}
      open={open}
      onClose={(): void => setOpen(false)}
      onChange={handleChange}
      renderOption={(_props, option, { selected }): JSX.Element => {
        return (
          <li {..._props}>
            {selected ? (
              <MenuOptionSelected>{option.displayTime}</MenuOptionSelected>
            ) : (
              <MenuOptionUnselected>{option.displayTime}</MenuOptionUnselected>
            )}
          </li>
        );
      }}
      renderInput={(params): JSX.Element => {
        return (
          <TextField
            {...params}
            fullWidth
            id={props.fieldName}
            name={props.fieldName}
            inputProps={{
              "aria-label": camelCaseToSentence(props.fieldName),
              "data-testid": props.fieldName,
              ...params.inputProps,
            }}
            autoComplete={"true"}
            variant="outlined"
            onClick={(): void => {
              setOpen(true);
            }}
            error={false}
            helperText={false}
          />
        );
      }}
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
