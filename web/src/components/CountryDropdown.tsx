import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { arrayOfCountriesObjects as countries, CountriesObject } from "@businessnjgovnavigator/shared/";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { ChangeEvent, FocusEvent, ReactElement, useState, type JSX } from "react";

interface Props {
  value: string | undefined;
  fieldName: string;
  onSelect: (value: CountriesObject | undefined) => void;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  error?: boolean;
  validationText?: string;
  excludeUS?: boolean;
  useFullName?: boolean;
  validationLabel?: string;
  autoComplete?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const CountryDropdown = (props: Props): ReactElement<any> => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOnChange = (event: ChangeEvent<unknown>, value: CountriesObject | null): void => {
    props.onSelect(value || undefined);
  };

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const invalid = props.required ? !value.trim() || getCountry(value) === undefined : false;

    props.onValidation && props.onValidation(props.fieldName, invalid);
  };

  const handleInputChange = (event: ChangeEvent<unknown>, value: string | null): void => {
    if (value === null || value === "") {
      props.onSelect(undefined);
    } else {
      const state = getCountry(value);
      state && props.onSelect(state);
    }
  };

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    trim: true,
    stringify: (option: CountriesObject) => {
      return props.useFullName ? option.name : option.shortCode;
    },
  });

  const filteredCountries = (): CountriesObject[] =>
    props.excludeUS
      ? countries.filter((country) => {
          return country.shortCode !== "US";
        })
      : countries;

  const getCountry = (value: string | undefined): CountriesObject | undefined => {
    return filteredCountries().find((country: CountriesObject) => {
      return country.name === value || country.shortCode === value?.toUpperCase();
    });
  };

  return (
    <Autocomplete
      options={filteredCountries()}
      value={getCountry(props.value) || null}
      filterOptions={filterOptions}
      getOptionLabel={(option: CountriesObject): string => {
        return props.useFullName ? option.name : option.shortCode;
      }}
      isOptionEqualToValue={(option: CountriesObject, value: CountriesObject): boolean => {
        return option.shortCode === value.shortCode || option.name === value.name;
      }}
      open={open}
      disabled={props.disabled}
      onClose={(): void => setOpen(false)}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      onBlur={onValidation}
      onSubmit={onValidation}
      renderOption={(_props, option, { selected }): JSX.Element => {
        return (
          <li {..._props}>
            {selected ? (
              <MenuOptionSelected>{props.useFullName ? option.name : option.shortCode}</MenuOptionSelected>
            ) : (
              <MenuOptionUnselected>
                {props.useFullName ? option.name : option.shortCode}
              </MenuOptionUnselected>
            )}
          </li>
        );
      }}
      renderInput={(params): JSX.Element => {
        return (
          <TextField
            {...params}
            fullWidth
            id={props.fieldName}
            name={props.fieldName}
            disabled={props.disabled}
            inputProps={{
              "aria-label": camelCaseToSentence(props.fieldName),
              "data-testid": props.fieldName,
              ...params.inputProps,
            }}
            onSubmit={onValidation}
            autoComplete={props.autoComplete ? "country" : "no"}
            variant="outlined"
            onClick={(): void => {
              if (!props.disabled) {
                setOpen(true);
              }
            }}
            error={props.error}
            helperText={props.error && props.validationText}
          />
        );
      }}
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
