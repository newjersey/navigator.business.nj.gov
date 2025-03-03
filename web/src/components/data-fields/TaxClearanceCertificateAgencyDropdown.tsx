import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import {
  getTaxClearanceCertificateAgencies,
  LookupTaxClearanceCertificateAgenciesById,
} from "@businessnjgovnavigator/shared";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

export const TaxClearanceCertificateAgencyDropdown = (): ReactElement => {
  const { state, setTaxClearanceCertificateData } = useContext(TaxClearanceCertificateDataContext);

  const handleChange = (event: SelectChangeEvent): void => {
    if (event.target.value) {
      setTaxClearanceCertificateData({
        ...state,
        requestingAgencyId: event.target.value,
      });
    }
  };

  const renderValue = (value: string): ReactNode => {
    return value === "" ? <></> : <>{LookupTaxClearanceCertificateAgenciesById(value).name}</>;
  };

  return (
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
  );
};
