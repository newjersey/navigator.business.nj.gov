import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import { arrayOfStateObjects as states, StateObject } from "@businessnjgovnavigator/shared";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useState } from "react";

interface Props {
  value: string | undefined;
  fieldName: string;
  onSelect: (value: string | undefined) => void;
  placeholder?: string;
  onValidation?: (fieldName: string, invalid: boolean) => void;
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
    props.onValidation && props.onValidation(props.fieldName, invalid);
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
