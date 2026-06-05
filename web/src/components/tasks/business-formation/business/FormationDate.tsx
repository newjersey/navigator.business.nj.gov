import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import {
  getBusinessStartDateHelperText,
  getBusinessStartDateMaxDate,
  getBusinessStartDateRule,
} from "@/components/tasks/business-formation/business/BusinessDateValidators";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { isForeignCorporationOrNonprofit } from "@/lib/utils/helpers";
import {
  DateObject,
  advancedDateLibrary,
  defaultDateFormat,
  getCurrentDateInNewJersey,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ChangeEvent, InputHTMLAttributes, ReactElement, useContext, useMemo } from "react";

advancedDateLibrary();
type Props = {
  fieldName: "businessStartDate" | "foreignDateOfFormation";
};
export const FormationDate = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();
  const dateFormat = "MM/DD/YYYY";
  const floatClass = isForeignCorporationOrNonprofit(state.formationFormData.legalType)
    ? "float-none"
    : "float-left";

  const contentProps = useMemo(
    () => ({
      businessStartDate: {
        label: (
          <div>
            <div className={`${floatClass}`}>
              <strong>
                <ContextualInfoButton
                  text={Config.formation.fields.businessStartDate.label}
                  id={Config.formation.fields.businessStartDate.labelContextualInfo}
                />
              </strong>
            </div>
            <div className={`${floatClass}`}>
              <span>{Config.formation.fields.foreignDateOfFormation.labelSecondaryText}</span>
            </div>
          </div>
        ),
        helperText: getBusinessStartDateHelperText(state.formationFormData.legalType),
      },
      foreignDateOfFormation: {
        label: (
          <>
            <strong>{Config.formation.fields.foreignDateOfFormation.label}</strong>
            <span className="margin-left-05">
              {Config.formation.fields.foreignDateOfFormation.labelSecondaryText}
            </span>
          </>
        ),
        helperText: Config.formation.fields.foreignDateOfFormation.error,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.formationFormData.legalType],
  );

  const handleChange = (value: string): void => {
    setFieldsInteracted([props.fieldName]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        [props.fieldName]: value,
      };
    });
  };

  const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const parsedDate = parseDateWithFormat(event.target.value, dateFormat);
    handleChange(parsedDate.isValid() ? parsedDate.format(defaultDateFormat) : event.target.value);
  };

  const getMinDate = (): dayjs.Dayjs | undefined => {
    const startDate = dayjs(getCurrentDateInNewJersey().format(dateFormat));
    return props.fieldName === "businessStartDate" ? startDate : undefined;
  };

  const Picker =
    process.env.NODE_ENV === "test" || process.env.CI === "true" ? DesktopDatePicker : DatePicker;

  return (
    <>
      <div className="flex">{contentProps[props.fieldName].label}</div>
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Picker
            minDate={getMinDate()}
            disabled={
              props.fieldName === "businessStartDate" &&
              getBusinessStartDateRule(state.formationFormData.legalType) === "Today"
            }
            maxDate={
              props.fieldName === "businessStartDate"
                ? getBusinessStartDateMaxDate(state.formationFormData.legalType)
                : getCurrentDateInNewJersey().add(100, "years")
            }
            value={
              state.formationFormData[props.fieldName]
                ? parseDateWithFormat(
                    state.formationFormData[props.fieldName] ?? "",
                    defaultDateFormat,
                  )
                : null
            }
            format={dateFormat}
            onChange={(newValue: DateObject | null): void => {
              if (newValue) {
                handleChange(newValue.format(defaultDateFormat));
              }
              if (newValue === null) {
                handleChange("");
              }
            }}
            slotProps={{
              textField: {
                className: "width-100",
                error: doesFieldHaveError(props.fieldName),
                helperText:
                  doesFieldHaveError(props.fieldName) && contentProps[props.fieldName].helperText,
                slotProps: {
                  input: {
                    "aria-label": camelCaseToSentence(props.fieldName),
                  },
                  htmlInput: {
                    onChange: handleTextInputChange,
                    placeholder: "",
                    "data-testid": `date-${props.fieldName}`,
                  } as InputHTMLAttributes<HTMLInputElement> & Record<"data-testid", string>,
                },
                onBlur: (): void => {
                  setFieldsInteracted([props.fieldName]);
                },
                required: true,
                sx: {
                  svg: { fill: "#4b7600" },
                },
                variant: "outlined",
              },
            }}
          />
        </LocalizationProvider>
      </div>
    </>
  );
};
