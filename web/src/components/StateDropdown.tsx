import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { StateObject, arrayOfStateObjects as states } from "@businessnjgovnavigator/shared/";
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import { ChangeEvent, FocusEvent, ReactElement, useState, type JSX } from "react";

interface Props {
  value: string | undefined;
  fieldName: string;
  onSelect: (value: StateObject | undefined) => void;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  error?: boolean;
  validationText?: string;
  excludeNJ?: boolean;
  excludeTerritories?: boolean;
  includeOutsideUSA?: boolean;
  useFullName?: boolean;
  validationLabel?: string;
  autoComplete?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const StateDropdown = (props: Props): ReactElement<any> => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOnChange = (event: ChangeEvent<unknown>, value: StateObject | null): void => {
    props.onSelect(value || undefined);
  };

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const invalid = props.required ? !value.trim() || getState(value) === undefined : false;

    props.onValidation && props.onValidation(props.fieldName, invalid);
  };

  const handleInputChange = (event: ChangeEvent<unknown>, value: string | null): void => {
    if (value === null || value === "") {
      props.onSelect(undefined);
    } else {
      const state = getState(value);
      state && props.onSelect(state);
    }
  };

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    trim: true,
    stringify: (option: StateObject) => {
      return props.useFullName ? option.name : option.shortCode;
    },
  });

  const filteredStates = (): StateObject[] => {
    let result = states;
    if (!props.includeOutsideUSA) {
      result = result.filter((stateObject) => {
        return stateObject.shortCode !== "Outside of the USA";
      });
    }

    if (props.excludeNJ) {
      result = result.filter((stateObject) => {
        return stateObject.shortCode !== "NJ";
      });
    }

    if (props.excludeTerritories) {
      result = result.filter((stateObject) => {
        return (
          stateObject.shortCode !== "AS" && stateObject.shortCode !== "VI" && stateObject.shortCode !== "GU"
        );
      });
    }
    return result;
  };

  const getState = (value: string | undefined): StateObject | undefined => {
    return filteredStates().find((state: StateObject) => {
      return state.name === value || state.shortCode === value?.toUpperCase();
    });
  };

  return (
    <Autocomplete
      options={filteredStates()}
      value={getState(props.value) || null}
      filterOptions={filterOptions}
      getOptionLabel={(option: StateObject): string => {
        return props.useFullName ? option.name : option.shortCode;
      }}
      isOptionEqualToValue={(option: StateObject, value: StateObject): boolean => {
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
