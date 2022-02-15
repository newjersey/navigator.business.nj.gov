import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { TextFieldProps } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import React, { ReactElement, useContext, useEffect } from "react";
import { Content } from "../Content";
import { GenericTextField } from "../GenericTextField";

dayjs.extend(advancedFormat);

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
}

export const OnboardingDateOfFormation = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<Dayjs | null>(null);
  const [dateError, setDateError] = React.useState<boolean>(false);

  const onValidation = (): void => props.onValidation(fieldName, !(dateValue?.isValid() && !dateError));

  useEffect(() => {
    !!state.profileData.dateOfFormation && setDateValue(dayjs(state.profileData.dateOfFormation));
  }, [state.profileData.dateOfFormation]);

  const handleChange = (date: Dayjs | null) => {
    setDateValue(date);
    date?.isValid() &&
      setProfileData({
        ...state.profileData,
        [fieldName]: date?.date(1).format("YYYY-MM-DD"),
      });
  };

  const Picker = process.env.NODE_ENV === "test" ? DesktopDatePicker : DatePicker;
  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Picker
        views={["year", "month"]}
        inputFormat={"MM/YYYY"}
        disableMaskedInput={false}
        mask={"__/____"}
        disableFuture
        openTo="year"
        maxDate={dayjs()}
        value={dateValue}
        onClose={onValidation}
        onChange={handleChange}
        onError={(hasError: string | null) => setDateError(!!hasError)}
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
                  // onBlur: onValidation,
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
