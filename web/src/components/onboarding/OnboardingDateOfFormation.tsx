import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { TextFieldProps } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import React, { ReactElement, useContext } from "react";

dayjs.extend(advancedFormat);

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  required?: boolean;
  disabled?: boolean;
  headerAriaLevel?: number;
}

export const OnboardingDateOfFormation = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const fieldName = "dateOfFormation";
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [dateValue, setDateValue] = React.useState<Dayjs | null>(null);

  useMountEffectWhenDefined(() => {
    setDateValue(dayjs(state.profileData.dateOfFormation));
  }, state.profileData.dateOfFormation);
  const [dateError, setDateError] = React.useState<boolean>(false);
  const onValidation = (): void =>
    props.onValidation(
      fieldName,
      !((dateValue == null && !props.required) || (dateValue?.isValid() && !dateError))
    );

  const handleChange = (date: Dayjs | null) => {
    setDateValue(date);
    setProfileData({
      ...state.profileData,
      [fieldName]: date?.isValid() ? date?.date(1).format("YYYY-MM-DD") : undefined,
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
        disableFuture={!props.disabled}
        openTo="year"
        disabled={props.disabled}
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
                validationText={Config.onboardingDefaults.dateOfFormationErrorText}
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
