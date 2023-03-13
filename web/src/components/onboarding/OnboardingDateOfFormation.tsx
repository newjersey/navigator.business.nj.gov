import { GenericTextField } from "@/components/GenericTextField";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  advancedDateLibrary,
  DateObject,
  defaultDateFormat,
  getCurrentDate,
  parseDate,
} from "@businessnjgovnavigator/shared/";
import { TextFieldProps } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { ReactElement, useContext } from "react";

advancedDateLibrary();

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  futureAllowed: boolean;
  required?: boolean;
  disabled?: boolean;
  errorTextOverride?: string;
}

export const OnboardingDateOfFormation = (props: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<DateObject | null>(null);
  const [dateError, setDateError] = React.useState<boolean>(false);

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

  const onValidation = (): void => {
    return props.onValidation(
      fieldName,
      !((dateValue == null && !props.required) || (dateValue?.isValid() && !dateError))
    );
  };

  const handleChange = (date: DateObject | null) => {
    setDateValue(date);
    setProfileData({
      ...state.profileData,
      [fieldName]: date?.isValid() ? date?.date(1).format(defaultDateFormat) : undefined,
    });
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Picker
        views={["year", "month"]}
        inputFormat={"MM/YYYY"}
        disableMaskedInput={false}
        mask={"__/____"}
        disableFuture={!props.futureAllowed}
        openTo="year"
        disabled={props.disabled}
        maxDate={props.futureAllowed ? getCurrentDate().add(100, "years") : getCurrentDate()}
        value={dateValue}
        onClose={onValidation}
        onChange={handleChange}
        onError={(hasError: string | null) => {
          return setDateError(!!hasError);
        }}
        renderInput={(params: TextFieldProps) => {
          return (
            <div>
              <GenericTextField
                fieldName={fieldName}
                onValidation={onValidation}
                validationText={errorText}
                error={props.fieldStates[fieldName].invalid}
                inputProps={params.InputProps}
                fieldOptions={{
                  ...params,
                  inputProps: {
                    ...params.inputProps,
                    placeholder: "",
                  },
                  sx: { width: "50%", ...params.sx },
                  error: props.fieldStates[fieldName].invalid,
                }}
              />
            </div>
          );
        }}
      />
    </LocalizationProvider>
  );
};
