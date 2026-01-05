import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DateObject } from "@businessnjgovnavigator/shared/dateHelpers";
import { TextField, TextFieldProps } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactElement, useContext, ReactNode } from "react";
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

  const onChange = (newValue: unknown): void => {
    const dateObj = newValue as DateObject | null;
    const isDateValid = dateObj && dateObj.isValid();
    const newDateValue = isDateValid ? dateObj.toISOString() : "";

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
        <label htmlFor="sales-start-date-picker" className="text-bold">
          {Config.cigaretteLicenseStep3.fields.startDateOfSales.label}
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            enableAccessibleFieldDOMStructure={false}
            onChange={onChange}
            value={
              cigaretteLicenseData.salesInfoStartDate
                ? dayjs(cigaretteLicenseData.salesInfoStartDate)
                : null
            }
            slotProps={{
              textField: {
                id: "sales-start-date-picker",
                variant: "outlined",
                error: props.CMS_ONLY_show_error || isFormFieldInvalid,
                sx: {
                  svg: { fill: "#4b7600" },
                },
                inputProps: {
                  "aria-label": Config.cigaretteLicenseStep3.fields.startDateOfSales.label,
                },
                style: { maxWidth: 450 },
                onBlur: () => {
                  updateFormValidation(cigaretteLicenseData.salesInfoStartDate);
                },
                helperText:
                  (props.CMS_ONLY_show_error || isFormFieldInvalid) &&
                  Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText,
              },
            }}
            slots={{
              textField: (params: TextFieldProps): ReactNode => (
                <div className="width-100">
                  <TextField {...params} />
                </div>
              ),
            }}
          />
        </LocalizationProvider>
      </WithErrorBar>
    </div>
  );
};
