import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DateObject } from "@businessnjgovnavigator/shared/dateHelpers";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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

  const performValidation = (salesInfoStartDate?: string): void => {
    setIsValid(!!salesInfoStartDate && salesInfoStartDate !== "Invalid Date");
  };

  return (
    <div id="question-salesInfoStartDate">
      <WithErrorBar hasError={props.CMS_ONLY_show_error || isFormFieldInvalid} type={"ALWAYS"}>
        <label htmlFor="sales-start-date-picker" className="text-bold">
          {Config.cigaretteLicenseStep3.fields.startDateOfSales.label}
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            onChange={(newValue: DateObject | null) => {
              setCigaretteLicenseData((cigaretteLicenseData) => {
                return {
                  ...cigaretteLicenseData,
                  salesInfoStartDate: newValue ? newValue.format() : "",
                };
              });

              performValidation(newValue?.format());
            }}
            value={cigaretteLicenseData.salesInfoStartDate}
            renderInput={(params): JSX.Element => {
              return (
                <div className="width-100">
                  <TextField
                    id="sales-start-date-picker"
                    {...params}
                    variant="outlined"
                    error={props.CMS_ONLY_show_error || isFormFieldInvalid}
                    sx={{
                      svg: { fill: "#4b7600" },
                    }}
                    inputProps={{
                      ...params.inputProps,
                      "aria-label": Config.cigaretteLicenseStep3.fields.startDateOfSales.label,
                    }}
                    style={{ maxWidth: 450 }}
                    value={cigaretteLicenseData.salesInfoStartDate}
                    onBlur={() => {
                      performValidation(cigaretteLicenseData.salesInfoStartDate);
                    }}
                    helperText={
                      (props.CMS_ONLY_show_error || isFormFieldInvalid) &&
                      Config.cigaretteLicenseStep3.fields.startDateOfSales.errorRequiredText
                    }
                  />
                </div>
              );
            }}
          ></DatePicker>
        </LocalizationProvider>
      </WithErrorBar>
    </div>
  );
};
