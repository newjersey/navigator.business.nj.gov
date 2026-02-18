import { GenericTextField } from "@/components/GenericTextField";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  advancedDateLibrary,
  DateObject,
  defaultDateFormat,
  getCurrentDate,
  parseDate,
} from "@businessnjgovnavigator/shared";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { TextFieldProps } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { ReactElement, useContext } from "react";

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

  const handleChange = (date: unknown): void => {
    const dateObj = date as DateObject | null;
    setDateValue(dateObj);
    setProfileData({
      ...state.profileData,
      [fieldName]: dateObj?.isValid() ? dateObj?.date(1).format(defaultDateFormat) : undefined,
    });
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Picker
        enableAccessibleFieldDOMStructure={false}
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
            inputProps: {
              placeholder: "__/____",
            },
            error: isFormFieldInvalid,
            sx: { svg: { fill: "#4b7600" } },
          },
        }}
        slots={{
          textField: (params: TextFieldProps): ReactElement => {
            return (
              <GenericTextField
                inputWidth={props.inputWidth || "reduced"}
                fieldName={fieldName}
                onValidation={onValidation}
                validationText={errorText}
                error={isFormFieldInvalid}
                inputProps={params.InputProps}
                fieldOptions={{
                  ...params,
                  inputProps: {
                    ...params.inputProps,
                    placeholder: "__/____",
                  },
                  error: isFormFieldInvalid,
                  sx: { svg: { fill: "#4b7600" } },
                }}
              />
            );
          },
        }}
      />
    </LocalizationProvider>
  );
};
