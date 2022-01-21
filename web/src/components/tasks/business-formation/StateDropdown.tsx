import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useState } from "react";

interface Props {
  value: string | undefined;
  fieldName: string;
  onSelect: (value: string | undefined) => void;
  placeholder?: string;
  onValidation?: (invalid: boolean, fieldName: string) => void;
  error?: boolean;
  validationText?: string;
  validationLabel?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}

export const StateDropdown = (props: Props): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOnChange = (event: ChangeEvent<unknown>, value: StateObject | null) => {
    props.onSelect(value?.name || undefined);
  };
  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const invalid = props.required ? !value.trim() : false;
    props.onValidation && props.onValidation(invalid, props.fieldName);
  };
  const handleInputChange = (event: ChangeEvent<unknown>, value: string | null) => {
    if (value === null || value === "" || !!getState(value)) {
      props.onSelect(value || undefined);
    }
    if (event && event.nativeEvent.constructor.name === "Event") {
      //Generic events triggered by autofill
      onValidation(event as FocusEvent<HTMLInputElement>);
    }
  };

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    trim: true,
    stringify: (option: StateObject) => option.name,
  });

  const getState = (value: string | undefined): StateObject | undefined =>
    states.find((state: StateObject) => state.name == value || state.shortCode == value);

  return (
    <Autocomplete
      options={states}
      value={getState(props.value) || null}
      filterOptions={filterOptions}
      getOptionLabel={(option: StateObject) => option.name}
      isOptionEqualToValue={(option: StateObject, value: StateObject) =>
        option.shortCode === value.shortCode || option.name === value.name
      }
      open={open}
      disabled={props.disabled}
      onClose={() => setOpen(false)}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      onBlur={onValidation}
      onSubmit={onValidation}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          {selected ? (
            <MenuOptionSelected>{option.name}</MenuOptionSelected>
          ) : (
            <MenuOptionUnselected>{option.name}</MenuOptionUnselected>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          id={props.fieldName}
          name={props.fieldName}
          disabled={props.disabled}
          inputProps={{
            "aria-label": camelCaseToSentence(props.fieldName),
            "data-testid": props.fieldName,
            ...params.inputProps,
          }}
          onSubmit={onValidation}
          autoComplete={props.autoComplete}
          variant="outlined"
          placeholder={props.placeholder}
          onClick={() => (props.disabled ? null : setOpen(true))}
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

type StateObject = {
  shortCode: string;
  name: string;
};
export const states: StateObject[] = [
  { shortCode: "AK", name: "Alaska" },
  { shortCode: "AL", name: "Alabama" },
  { shortCode: "AR", name: "Arkansas" },
  { shortCode: "AS", name: "American Samoa" },
  { shortCode: "AZ", name: "Arizona" },
  { shortCode: "CA", name: "California" },
  { shortCode: "CO", name: "Colorado" },
  { shortCode: "CT", name: "Connecticut" },
  { shortCode: "DC", name: "District of Columbia" },
  { shortCode: "DE", name: "Delaware" },
  { shortCode: "FL", name: "Florida" },
  { shortCode: "GA", name: "Georgia" },
  { shortCode: "GU", name: "Guam" },
  { shortCode: "HI", name: "Hawaii" },
  { shortCode: "IA", name: "Iowa" },
  { shortCode: "ID", name: "Idaho" },
  { shortCode: "IL", name: "Illinois" },
  { shortCode: "IN", name: "Indiana" },
  { shortCode: "KS", name: "Kansas" },
  { shortCode: "KY", name: "Kentucky" },
  { shortCode: "LA", name: "Louisiana" },
  { shortCode: "MA", name: "Massachusetts" },
  { shortCode: "MD", name: "Maryland" },
  { shortCode: "ME", name: "Maine" },
  { shortCode: "MI", name: "Michigan" },
  { shortCode: "MN", name: "Minnesota" },
  { shortCode: "MO", name: "Missouri" },
  { shortCode: "MS", name: "Mississippi" },
  { shortCode: "MT", name: "Montana" },
  { shortCode: "NC", name: "North Carolina" },
  { shortCode: "ND", name: "North Dakota" },
  { shortCode: "NE", name: "Nebraska" },
  { shortCode: "NH", name: "New Hampshire" },
  { shortCode: "NJ", name: "New Jersey" },
  { shortCode: "NM", name: "New Mexico" },
  { shortCode: "NV", name: "Nevada" },
  { shortCode: "NY", name: "New York" },
  { shortCode: "OH", name: "Ohio" },
  { shortCode: "OK", name: "Oklahoma" },
  { shortCode: "OR", name: "Oregon" },
  { shortCode: "PA", name: "Pennsylvania" },
  { shortCode: "PR", name: "Puerto Rico" },
  { shortCode: "RI", name: "Rhode Island" },
  { shortCode: "SC", name: "South Carolina" },
  { shortCode: "SD", name: "South Dakota" },
  { shortCode: "TN", name: "Tennessee" },
  { shortCode: "TX", name: "Texas" },
  { shortCode: "UT", name: "Utah" },
  { shortCode: "VA", name: "Virginia" },
  { shortCode: "VI", name: "Virgin Islands" },
  { shortCode: "VT", name: "Vermont" },
  { shortCode: "WA", name: "Washington" },
  { shortCode: "WI", name: "Wisconsin" },
  { shortCode: "WV", name: "West Virginia" },
  { shortCode: "WY", name: "Wyoming" },
];
