import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DateObject } from "@businessnjgovnavigator/shared/dateHelpers";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactElement, useContext } from "react";
interface Props {
  CMS_ONLY_show_error?: boolean;
}

export const CigaretteSalesStartDate = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: cigaretteLicenseData, setCigaretteLicenseData } =
    useContext(CigaretteLicenseContext);

  const { isFormFieldInvalid, setIsValid } = useFormContextFieldHelpers(
    "salesInfoStartDate",
    DataFormErrorMapContext,
  );

  const updateFormValidation = (salesInfoStartDate?: string): void => {
    setIsValid(!!salesInfoStartDate);
  };

  const onChange = (newValue: DateObject | null): void => {
    const isDateValid = newValue && newValue.isValid();
    const newDateValue = isDateValid ? newValue.toISOString() : "";

    setCigaretteLicenseData((cigaretteLicenseData) => {
      return {
        ...cigaretteLicenseData,
        salesInfoStartDate: newDateValue,
      };
    });

    updateFormValidation(newDateValue);
  };

  return (
    <div id="question-salesInfoStartDate">
      <WithErrorBar hasError={props.CMS_ONLY_show_error || isFormFieldInvalid} type={"ALWAYS"}>
        <span id="sales-start-date-picker-label" className="text-bold">
          {Config.cigaretteLicenseStep3.fields.startDateOfSales.label}
        </span>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            onChange={onChange}
            value={
              cigaretteLicenseData.salesInfoStartDate
                ? dayjs(cigaretteLicenseData.salesInfoStartDate)
                : null
            }
            slotProps={{
              textField: {
                className: "width-100",
                error: props.CMS_ONLY_show_error || isFormFieldInvalid,
                helperText:
                  (props.CMS_ONLY_show_error || isFormFieldInvalid) &&
                  Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText,
                id: "sales-start-date-picker",
                slotProps: {
                  input: {
                    "aria-labelledby": "sales-start-date-picker-label",
                  },
                },
                onBlur: () => {
                  updateFormValidation(cigaretteLicenseData.salesInfoStartDate);
                },
                style: { maxWidth: 450 },
                sx: {
                  svg: { fill: "#4b7600" },
                },
                variant: "outlined",
              },
            }}
          />
        </LocalizationProvider>
      </WithErrorBar>
    </div>
  );
};
