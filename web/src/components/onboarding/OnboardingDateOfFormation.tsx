import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { TextFieldProps } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import React, { ReactElement, useContext } from "react";
import { Content } from "../Content";
import { GenericTextField } from "../GenericTextField";

dayjs.extend(advancedFormat);

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingDateOfFormation = (props: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<Dayjs | null>(
    state.profileData[fieldName] ? dayjs(state.profileData[fieldName]) : null
  );
  const [dateError, setDateError] = React.useState<boolean>(false);

  const onValidation = (): void => {
    additionalValidation(dateValue) && handleChange(dateValue as Dayjs);
    props.onValidation && props.onValidation(fieldName, !additionalValidation(dateValue));
  };

  const additionalValidation = (newValue: Dayjs | null): boolean =>
    newValue !== null && newValue?.isValid() && !dateError;

  const handleChange = (dayjs: Dayjs) => {
    setProfileData({
      ...state.profileData,
      [fieldName]: dayjs?.format("YYYY-MM-DD"),
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={["year", "month", "day"]}
        disableFuture
        openTo="year"
        maxDate={dayjs()}
        value={dateValue}
        onClose={() => onValidation()}
        inputFormat={"MM/DD/YYYY"}
        onChange={(newValue: Dayjs | null): void => {
          additionalValidation(newValue) && handleChange(newValue as Dayjs);
          setDateValue(newValue);
        }}
        onError={(value: string | null) => {
          setDateError(!!value);
        }}
        renderInput={(params: TextFieldProps) => (
          <div>
            {state.displayContent[fieldName].contentMd && (
              <div className="margin-bottom-2" data-testid={`onboardingFieldContent-${fieldName}`}>
                <Content overrides={{ h2: headerLevelTwo }}>
                  {state.displayContent[fieldName].contentMd}
                </Content>
              </div>
            )}
            <div className="form-input">
              <GenericTextField
                fieldName={fieldName}
                onValidation={onValidation}
                validationText={OnboardingDefaults.dateOfFormationErrorText}
                error={props.fieldStates[fieldName].invalid}
                fieldOptions={{
                  ...params,
                  sx: { width: "50%", ...params.sx },
                  error: props.fieldStates[fieldName].invalid,
                }}
              />
            </div>
          </div>
        )}
      />
    </LocalizationProvider>
  );
};
