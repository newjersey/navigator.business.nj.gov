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
import { ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  preventRefreshWhenUnmounted?: boolean;
}

export const StateAgencyDropdown = (props: Props): ReactElement => {
  const { state, setTaxClearanceCertificateData } = useContext(TaxClearanceCertificateDataContext);
  const { Config } = useConfig();
  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    "requestingAgencyId",
    DataFormErrorMapContext,
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

  const isValid = state.requestingAgencyId !== "";

  const performValidation = (): void => {
    setIsValid(isValid);
  };

  RegisterForOnSubmit(() => isValid, props.preventRefreshWhenUnmounted);

  const renderValue = (value: string): ReactNode => {
    return <>{value && LookupTaxClearanceCertificateAgenciesById(value).name}</>;
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS">
        <label htmlFor="tax-clearance-certificate-agency-dropdown">
          <Content className={"text-bold margin-bottom-05"}>
            {Config.taxClearanceCertificateStep2.requestingAgencyLabel}
          </Content>
        </label>
        <FormControl variant="outlined" fullWidth error={isFormFieldInvalid}>
          <Select
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
            fullWidth
            displayEmpty
            value={state.requestingAgencyId || ""}
            onChange={handleChange}
            name="tax-clearance-certificate-agency-dropdown"
            renderValue={renderValue}
            inputProps={{
              "aria-label": "Tax clearance certificate requesting agency",
              id: "tax-clearance-certificate-agency-dropdown",
            }}
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
