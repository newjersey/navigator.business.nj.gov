import { Content } from "@/components/Content";
import {
  getBusinessStartDateHelperText,
  getBusinessStartDateMaxDate,
  getBusinessStartDateRule,
} from "@/components/tasks/business-formation/business/BusinessDateValidators";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  advancedDateLibrary,
  DateObject,
  defaultDateFormat,
  getCurrentDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { TextField } from "@mui/material";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactElement, useContext, useMemo } from "react";

advancedDateLibrary();
type Props = {
  fieldName: "businessStartDate" | "foreignDateOfFormation";
};
export const FormationDate = (props: Props): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const contentProps = useMemo(
    () => ({
      businessStartDate: {
        label: Config.businessFormationDefaults.businessStartDateLabel,
        helperText: getBusinessStartDateHelperText(state.formationFormData.legalType),
      },
      foreignDateOfFormation: {
        label: Config.businessFormationDefaults.foreignDateOfFormationLabel,
        helperText: Config.businessFormationDefaults.foreignDateOfFormationErrorText,
      },
    }),
    [state.formationFormData.legalType]
  );

  const handleChange = (value: string) => {
    setFieldsInteracted([props.fieldName]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        [props.fieldName]: value,
      };
    });
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;
  return (
    <>
      <div className="flex margin-bottom-2">
        <Content key={`${props.fieldName}Md`}>{contentProps[props.fieldName].label}</Content>
      </div>
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Picker
            minDate={props.fieldName == "businessStartDate" ? getCurrentDate() : undefined}
            disabled={
              props.fieldName == "businessStartDate" &&
              getBusinessStartDateRule(state.formationFormData.legalType) == "Today"
            }
            maxDate={
              props.fieldName == "businessStartDate"
                ? getBusinessStartDateMaxDate(state.formationFormData.legalType)
                : getCurrentDate().add(100, "years")
            }
            value={
              state.formationFormData[props.fieldName]
                ? parseDateWithFormat(state.formationFormData[props.fieldName] ?? "", defaultDateFormat)
                : null
            }
            inputFormat={"MM/DD/YYYY"}
            onChange={(newValue: DateObject | null): void => {
              if (newValue) {
                handleChange(newValue.format(defaultDateFormat));
              }
              if (newValue === null) {
                handleChange("");
              }
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  error={doesFieldHaveError(props.fieldName)}
                  onBlur={() => {
                    setFieldsInteracted([props.fieldName]);
                  }}
                  helperText={
                    doesFieldHaveError(props.fieldName) ? contentProps[props.fieldName].helperText : " "
                  }
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": camelCaseToSentence(props.fieldName),
                    "data-testid": `date-${props.fieldName}`,
                  }}
                />
              );
            }}
          />
        </LocalizationProvider>
      </div>
    </>
  );
};
