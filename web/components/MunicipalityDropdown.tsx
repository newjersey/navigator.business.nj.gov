import { Municipality } from "@businessnjgovnavigator/shared";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { createFilterOptions, TextField } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useState } from "react";
import { Autocomplete } from "@mui/material";
import { ProfileFields } from "@/lib/types/types";

interface Props {
  fieldName: ProfileFields;
  municipalities: Municipality[];
  value: Municipality | undefined;
  onSelect: (value: Municipality | undefined) => void;
  placeholderText: string;
  handleChange?: () => void;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  validationText?: string;
  validationLabel?: string;
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

  const splitAndBoldSearchText = (displayName: string): ReactElement => {
    const index = displayName.toLowerCase().indexOf(searchText.toLowerCase());
    if (index >= 0) {
      const prefixText = displayName.substr(0, index);
      const toBold = displayName.substr(index, searchText.length);
      const afterText = displayName.substr(index + searchText.length);
      return (
        <span style={{ whiteSpace: "pre-wrap" }}>
          {prefixText}
          <span className="text-bold">{toBold}</span>
          {afterText}
        </span>
      );
    } else {
      return <>{displayName}</>;
    }
  };
  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option: Municipality) => option.displayName,
  });
  return (
    <Autocomplete
      options={props.municipalities}
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
            <MenuOptionUnselected>{splitAndBoldSearchText(option.displayName)}</MenuOptionUnselected>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          id={props.fieldName}
          inputProps={{
            "aria-label": "Location",
            "data-testid": props.fieldName,
            ...params.inputProps,
          }}
          value={searchText}
          onChange={handleChange}
          onSubmit={props.onValidation}
          variant="outlined"
          placeholder={props.placeholderText}
          error={props.error}
          label={props.error && (props.validationLabel ?? "")}
          helperText={props.error && (props.validationText ?? "")}
        />
      )}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
