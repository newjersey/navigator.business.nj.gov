import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence, splitAndBoldSearchText } from "@/lib/utils/helpers";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useState } from "react";

interface Props {
  readonly fieldName: string;
  readonly municipalities: readonly Municipality[];
  readonly value: Municipality | undefined;
  readonly onSelect: (value: Municipality | undefined) => void;
  readonly placeholderText: string;
  readonly handleChange?: () => void;
  readonly onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  readonly error?: boolean;
  readonly ariaLabel?: string;
  readonly validationText?: string;
  readonly validationLabel?: string;
}

export const MunicipalityDropdown = (props: Props): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    setSearchText(event.target.value);
  };

  const handleMunicipality = (event: ChangeEvent<unknown>, value: Municipality | null) => {
    props.handleChange && props.handleChange();
    setSearchText(value ? value.displayName : "");
    props.onSelect(value || undefined);
  };

  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: Municipality) => option.displayName,
  });

  return (
    <Autocomplete
      options={props.municipalities}
      id={props.fieldName}
      filterOptions={filterOptions}
      getOptionLabel={(municipality: Municipality) => municipality.displayName}
      isOptionEqualToValue={(option: Municipality, value: Municipality) => option.id === value.id}
      value={props.value || null}
      onChange={handleMunicipality}
      onBlur={props.onValidation}
      onSubmit={props.onValidation}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          {selected ? (
            <MenuOptionSelected>{option.displayName}</MenuOptionSelected>
          ) : (
            <MenuOptionUnselected>
              {splitAndBoldSearchText(option.displayName, searchText)}
            </MenuOptionUnselected>
          )}
        </li>
      )}
      renderInput={(params) => (
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
          placeholder={props.placeholderText}
          error={props.error}
          helperText={props.error ? props.validationText ?? " " : " "}
        />
      )}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
