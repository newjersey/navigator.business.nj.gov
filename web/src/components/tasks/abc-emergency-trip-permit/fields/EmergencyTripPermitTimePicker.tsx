import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { EmergencyTripPermitUserEnteredFieldNames } from "@businessnjgovnavigator/shared";
import { Autocomplete, FormHelperText, TextField } from "@mui/material";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { ChangeEvent, ReactElement, useContext, useState } from "react";

interface Props {
  fieldName: EmergencyTripPermitUserEnteredFieldNames;
}

interface FormattedTime {
  displayTime: string;
  internalTime: string;
}

const generateAllTimesWithHalfHourIncrement = (
  startHour: number,
  startAtZeroMinutes: boolean,
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

export const getFormattedTimeFromInternalTime = (value?: string): FormattedTime | null => {
  if (!value || value === "") {
    return null;
  }
  const timeParts = value.split(":");
  return {
    displayTime: dayjs().hour(Number(timeParts[0])).minute(Number(timeParts[1])).format("hh:mm a"),
    internalTime: value,
  };
};

export const EmergencyTripPermitTimePicker = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [open, setOpen] = useState<boolean>(false);
  const context = useContext(EmergencyTripPermitContext);
  const { isFormFieldInvalid, setIsValid } = useFormContextFieldHelpers(
    props.fieldName,
    DataFormErrorMapContext,
  );
  const { getFieldErrorLabel, doesFieldHaveError } = useEmergencyTripPermitErrors();
  dayjs.extend(timezone);

  const options = generateAllTimesWithHalfHourIncrement(0, true);
  const handleChange = (event: ChangeEvent<unknown>, value: FormattedTime | null): void => {
    context.setApplicationInfo({
      ...context.state.applicationInfo,
      [props.fieldName]: value?.internalTime || "",
    });
    if (value?.internalTime !== "") {
      setIsValid(true);
    }
  };

  return (
    <WithErrorBar hasError={isFormFieldInvalid} type={"ALWAYS"}>
      <label>
        <span className={"text-bold"}>{Config.abcEmergencyTripPermit.fields.permitStartTime}</span>
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
          onClose={(): void => {
            setOpen(false);
          }}
          onChange={handleChange}
          renderOption={(_props, option, { selected }): JSX.Element => {
            const { key, ...otherProps } = _props;
            return (
              <li key={key} {...otherProps}>
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
      </label>
      <div>
        {isFormFieldInvalid && doesFieldHaveError(props.fieldName) && (
          <>
            <FormHelperText error>{`${getFieldErrorLabel(props.fieldName)}`}</FormHelperText>
            <div aria-live="polite" className="screen-reader-only">{`${
              Config.siteWideErrorMessages.errorScreenReaderInlinePrefix
            } ${camelCaseToSentence(props.fieldName)}, ${getFieldErrorLabel(
              props.fieldName,
            )}`}</div>
          </>
        )}
      </div>
    </WithErrorBar>
  );
};
