import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { splitAndBoldSearchText } from "@/lib/utils/splitAndBoldSearchText";
import { Municipality } from "@businessnjgovnavigator/shared";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { ChangeEvent, FocusEvent, ReactElement, useState, type JSX } from "react";

interface Props {
  fieldName: string;
  municipalities: Municipality[];
  value: Municipality | undefined;
  onSelect: (value: Municipality | undefined) => void;
  helperText: string;
  disabled?: boolean;
  handleChange?: () => void;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  ariaLabel?: string;
  validationLabel?: string;
  hideErrorLabel?: boolean;
}

export const MunicipalityDropdown = (props: Props): ReactElement<any> => {
  const [searchText, setSearchText] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    setSearchText(event.target.value);
  };

  const handleMunicipality = (event: ChangeEvent<unknown>, value: Municipality | null): void => {
    props.handleChange && props.handleChange();
    setSearchText(value ? value.displayName : "");
    props.onSelect(value || undefined);
  };

  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: Municipality) => {
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
      options={props.municipalities}
      id={props.fieldName}
      filterOptions={filterOptions}
      getOptionLabel={(municipality: Municipality): string => {
        return municipality.displayName;
      }}
      isOptionEqualToValue={(option: Municipality, value: Municipality): boolean => {
        return option.id === value.id;
      }}
      value={props.value || null}
      onChange={handleMunicipality}
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
          <div className="text-field-width-default">
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
