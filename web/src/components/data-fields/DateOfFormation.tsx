import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  advancedDateLibrary,
  DateObject,
  defaultDateFormat,
  getCurrentDate,
  parseDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { InputHTMLAttributes, ReactElement, useContext } from "react";

advancedDateLibrary();

interface Props {
  futureAllowed: boolean;
  required?: boolean;
  disabled?: boolean;
  errorTextOverride?: string;
  inputWidth?: "full" | "default" | "reduced";
}

export const DateOfFormation = (props: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<DateObject | null>(null);
  const [dateError, setDateError] = React.useState<boolean>(false);

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    fieldName,
    DataFormErrorMapContext,
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["dateOfFormation"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  const errorText = props.errorTextOverride || contentFromConfig.errorTextRequired;

  useMountEffectWhenDefined(() => {
    setDateValue(parseDate(state.profileData.dateOfFormation));
  }, state.profileData.dateOfFormation);

  const isValid = (): boolean =>
    ((dateValue === null && !props.required) || (dateValue?.isValid() && !dateError)) ?? false;

  RegisterForOnSubmit(isValid);
  const onValidation = (): void => setIsValid(isValid());

  const handleChange = (date: DateObject | null): void => {
    setDateValue(date);
    setProfileData({
      ...state.profileData,
      [fieldName]: date?.isValid() ? date?.date(1).format(defaultDateFormat) : undefined,
    });
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.value.trim() === "") {
      handleChange(null);
      return;
    }

    const date = parseDateWithFormat(event.target.value, "MM/YYYY");
    handleChange(date);
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Picker
        views={["year", "month"]}
        format={"MM/YYYY"}
        disableFuture={!props.futureAllowed}
        openTo="year"
        disabled={props.disabled}
        maxDate={props.futureAllowed ? getCurrentDate().add(100, "years") : getCurrentDate()}
        value={dateValue}
        onClose={onValidation}
        onChange={handleChange}
        onError={(hasError): void => {
          setDateError(!!hasError);
        }}
        slotProps={{
          textField: {
            className:
              props.inputWidth === "full"
                ? "width-100"
                : props.inputWidth === "default"
                  ? "text-field-width-default"
                  : "text-field-width-reduced",
            error: isFormFieldInvalid,
            helperText: isFormFieldInvalid && errorText,
            onBlur: onValidation,
            required: props.required,
            slotProps: {
              input: {
                "aria-label": camelCaseToSentence(fieldName),
              },
              htmlInput: {
                name: fieldName,
                "data-testid": `date-${fieldName}`,
                onChange: handleTextInputChange,
                placeholder: "__/____",
              } as InputHTMLAttributes<HTMLInputElement> & Record<"data-testid", string>,
            },
            sx: { svg: { fill: "#4b7600" } },
          },
        }}
      />
    </LocalizationProvider>
  );
};
