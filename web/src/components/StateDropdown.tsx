import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { arrayOfStateObjects as states, StateObject } from "@businessnjgovnavigator/shared/";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { ChangeEvent, FocusEvent, ReactElement, useState } from "react";

interface Props {
  value: string | undefined;
  fieldName: string;
  onSelect: (value: StateObject | undefined) => void;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  error?: boolean;
  validationText?: string;
  className?: string;
  excludeNJ?: boolean;
  useFullName?: boolean;
  validationLabel?: string;
  autoComplete?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const StateDropdown = (props: Props): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOnChange = (event: ChangeEvent<unknown>, value: StateObject | null) => {
    props.onSelect(value || undefined);
  };

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const invalid = props.required ? !value.trim() || getState(value) === undefined : false;

    props.onValidation && props.onValidation(props.fieldName, invalid);
  };

  const handleInputChange = (event: ChangeEvent<unknown>, value: string | null) => {
    if (value === null || value === "") {
      props.onSelect(undefined);
    } else {
      const state = getState(value);
      state && props.onSelect(state);
    }
    if (event && event.nativeEvent.constructor.name === "Event") {
      //Generic events triggered by autofill
      onValidation(event as FocusEvent<HTMLInputElement>);
    }
  };

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    trim: true,
    stringify: (option: StateObject) => {
      return props.useFullName ? option.name : option.shortCode;
    },
  });

  const filteredStates = () =>
    props.excludeNJ
      ? states.filter((stateObject) => {
          return stateObject.shortCode !== "NJ";
        })
      : states;

  const getState = (value: string | undefined): StateObject | undefined => {
    return filteredStates().find((state: StateObject) => {
      return state.name === value || state.shortCode === value?.toUpperCase();
    });
  };

  return (
    <Autocomplete
      options={filteredStates()}
      className={props.className ?? ""}
      value={getState(props.value) || null}
      filterOptions={filterOptions}
      getOptionLabel={(option: StateObject) => {
        return props.useFullName ? option.name : option.shortCode;
      }}
      isOptionEqualToValue={(option: StateObject, value: StateObject) => {
        return option.shortCode === value.shortCode || option.name === value.name;
      }}
      open={open}
      disabled={props.disabled}
      onClose={() => {
        return setOpen(false);
      }}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      onBlur={onValidation}
      onSubmit={onValidation}
      renderOption={(_props, option, { selected }) => {
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
      renderInput={(params) => {
        return (
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
            autoComplete={props.autoComplete ? "address-level1" : "no"}
            variant="outlined"
            onClick={() => {
              return props.disabled ? null : setOpen(true);
            }}
            error={props.error}
            helperText={props.error ? props.validationText ?? " " : " "}
          />
        );
      }}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
