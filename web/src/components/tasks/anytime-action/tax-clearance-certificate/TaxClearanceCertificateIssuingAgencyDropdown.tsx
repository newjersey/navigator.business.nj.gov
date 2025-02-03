import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { splitAndBoldSearchText } from "@/lib/utils/splitAndBoldSearchText";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { ChangeEvent, FocusEvent, ReactElement, useState } from "react";
import {TaxClearanceCertificateIssuingAgency} from "@businessnjgovnavigator/shared/taxClearanceCertificate";

interface Props {
  fieldName: string;
  taxClearances: TaxClearanceCertificateIssuingAgency [];
  value: TaxClearanceCertificateIssuingAgency | undefined;
  onSelect: (value: TaxClearanceCertificateIssuingAgency | undefined) => void;
  helperText: string;
  disabled?: boolean;
  handleChange?: () => void;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  ariaLabel?: string;
  validationLabel?: string;
  hideErrorLabel?: boolean;
}

export const TaxClearanceCertificateIssuingAgencyDropdown = (props: Props): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    setSearchText(event.target.value);
  };

  const handleTaxClearance = (event: ChangeEvent<unknown>, value: TaxClearanceCertificateIssuingAgency | null): void => {
    props.handleChange && props.handleChange();
    setSearchText(value ? value.displayName : "");
    props.onSelect(value || undefined);
  };

  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: TaxClearanceCertificateIssuingAgency) => {
      return option.displayName;
    },
  });

  const getHelperText = (): string | undefined => {
    if (props.hideErrorLabel) {
      return undefined;
    }
    return props.error ? props.helperText : "";
  };

  return (
    <Autocomplete
      options={props.taxClearances}
      id={props.fieldName}
      filterOptions={filterOptions}
      getOptionLabel={(taxClearance: TaxClearanceCertificateIssuingAgency): string => {
        return taxClearance.displayName;
      }}
      isOptionEqualToValue={(
        option: TaxClearanceCertificateIssuingAgency,
        value: TaxClearanceCertificateIssuingAgency
      ): boolean => {
        return option.name === value.name;
      }}
      value={props.value || null}
      onChange={handleTaxClearance}
      disabled={props.disabled}
      onBlur={props.onValidation}
      onSubmit={props.onValidation}
      renderOption={(props, option, { selected }): JSX.Element => {
        return (
          <li {...props}>
            {selected ? (
              <MenuOptionSelected>{option.displayName}</MenuOptionSelected>
            ) : (
              <MenuOptionUnselected>
                {splitAndBoldSearchText(option.displayName, searchText)}
              </MenuOptionUnselected>
            )}
          </li>
        );
      }}
      renderInput={(params): JSX.Element => {
        return (
          <div>
            <TextField
              {...params}
              inputProps={{
                "aria-label": props.ariaLabel ?? camelCaseToSentence(props.fieldName),
                "data-testid": props.fieldName,
                ...params.inputProps,
              }}
              value={searchText}
              onChange={handleChange}
              onSubmit={props.onValidation}
              variant="outlined"
              error={props.error}
              helperText={getHelperText()}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#FFFFFF",
                },
              }}
            />
          </div>
        );
      }}
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
