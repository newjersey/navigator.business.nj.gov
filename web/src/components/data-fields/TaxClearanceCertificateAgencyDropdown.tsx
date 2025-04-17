import { Content } from "@/components/Content";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import {
  getTaxClearanceCertificateAgencies,
  LookupTaxClearanceCertificateAgenciesById,
} from "@businessnjgovnavigator/shared";
import { FormControl, FormHelperText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

export const TaxClearanceCertificateAgencyDropdown = (): ReactElement => {
  const { state, setTaxClearanceCertificateData } = useContext(TaxClearanceCertificateDataContext);
  const { Config } = useConfig();
  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    "requestingAgencyId",
    DataFormErrorMapContext
  );
  const handleChange = (event: SelectChangeEvent): void => {
    if (event.target.value) {
      setTaxClearanceCertificateData({
        ...state,
        requestingAgencyId: event.target.value,
      });
      setIsValid(true);
    }
  };

  const isValid = (): boolean => state.requestingAgencyId !== "";

  const performValidation = (): void => {
    setIsValid(isValid());
  };

  RegisterForOnSubmit(isValid);

  const renderValue = (value: string): ReactNode => {
    if (value === "") {
      return <></>;
    }
    return <>{LookupTaxClearanceCertificateAgenciesById(value).name}</>;
  };

  return (
    <>
      <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS">
        <Content className={"text-bold margin-bottom-05"}>
          {Config.taxClearanceCertificateStep2.requestingAgencyLabel}
        </Content>
        <FormControl variant="outlined" fullWidth error={isFormFieldInvalid}>
          <Select
            fullWidth
            displayEmpty
            value={state.requestingAgencyId || ""}
            onChange={handleChange}
            name="tax-clearance-certificate-agency-dropdown"
            renderValue={renderValue}
            inputProps={{
              "aria-label": "Tax clearance certificate requesting agency",
            }}
            data-testid={"requesting-agency-dropdown"}
            onBlur={performValidation}
          >
            {getTaxClearanceCertificateAgencies().map((agency) => {
              return (
                <MenuItem key={agency.id} value={agency.id} data-testid={agency.id}>
                  <div className="padding-top-1 padding-bottom-1">
                    {state.requestingAgencyId === agency.id ? (
                      <MenuOptionSelected>{agency.name}</MenuOptionSelected>
                    ) : (
                      <MenuOptionUnselected>{agency.name}</MenuOptionUnselected>
                    )}
                  </div>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormHelperText className={"text-error-dark"}>
          {isFormFieldInvalid && Config.taxClearanceCertificateShared.requestingAgencyErrorText}
        </FormHelperText>
      </WithErrorBar>
    </>
  );
};
