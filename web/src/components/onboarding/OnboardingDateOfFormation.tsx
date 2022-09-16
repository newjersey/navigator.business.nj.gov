import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { advancedDateLibrary, DateObject, getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/";
import { TextFieldProps } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { ReactElement, useContext } from "react";

advancedDateLibrary();

interface DateOfFormationConfig {
  header?: string;
  description?: string;
  errorText?: string;
}

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  futureAllowed: boolean;
  required?: boolean;
  disabled?: boolean;
  headerAriaLevel?: number;
  configOverrides?: DateOfFormationConfig;
}

export const OnboardingDateOfFormation = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<DateObject | null>(null);
  const [dateError, setDateError] = React.useState<boolean>(false);

  const contentConfig = {
    header: props.configOverrides?.header || Config.profileDefaults[state.flow].dateOfFormation.header,
    description:
      props.configOverrides?.description || Config.profileDefaults[state.flow].dateOfFormation.description,
    errorText:
      props.configOverrides?.errorText ||
      Config.profileDefaults[state.flow].dateOfFormation.errorTextRequired,
  };

  useMountEffectWhenDefined(() => {
    setDateValue(parseDate(state.profileData.dateOfFormation));
  }, state.profileData.dateOfFormation);

  const onValidation = (): void =>
    props.onValidation(
      fieldName,
      !((dateValue == null && !props.required) || (dateValue?.isValid() && !dateError))
    );

  const handleChange = (date: DateObject | null) => {
    setDateValue(date);
    setProfileData({
      ...state.profileData,
      [fieldName]: date?.isValid() ? date?.date(1).format("YYYY-MM-DD") : undefined,
    });
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;
  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

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
        onError={(hasError: string | null) => setDateError(!!hasError)}
        renderInput={(params: TextFieldProps) => (
          <div>
            <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${fieldName}`}>
              <Content overrides={{ h2: headerLevelTwo }}>{contentConfig.header}</Content>
              <Content>{contentConfig.description}</Content>
            </div>
            <GenericTextField
              fieldName={fieldName}
              onValidation={onValidation}
              validationText={contentConfig.errorText}
              error={props.fieldStates[fieldName].invalid}
              fieldOptions={{
                ...params,
                sx: { width: "50%", ...params.sx },
                error: props.fieldStates[fieldName].invalid,
              }}
            />
          </div>
        )}
      />
    </LocalizationProvider>
  );
};
