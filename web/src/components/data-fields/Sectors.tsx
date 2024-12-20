import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { LookupSectorTypeById, SectorType, arrayOfSectors as sectors } from "@businessnjgovnavigator/shared";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { Autocomplete, TextField } from "@mui/material";
import { orderBy } from "lodash";
import React, { ChangeEvent, ReactElement, useContext, useState, type JSX } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  isSectorModal?: boolean;
}

export const Sectors = <T,>(props: Props<T>): ReactElement<any> => {
  const [searchText, setSearchText] = useState<string>("");
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    "sectorId",
    ProfileFormContext,
    props.errorTypes
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["sectorId"]["default"] = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: "sectorId",
  });

  const SectorsOrdered: SectorType[] = orderBy(sectors, (SectorType: SectorType) => {
    return SectorType.name;
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
  };

  const handleSectorSelect = (
    event: React.SyntheticEvent<Element, Event>,
    value: SectorType | null
  ): void => {
    if (!value) {
      setSearchText("");
      setProfileData({ ...state.profileData, sectorId: "" });
    } else if (LookupSectorTypeById((value as SectorType).id).name) {
      setProfileData({ ...state.profileData, sectorId: (value as SectorType).id });
      setSearchText(LookupSectorTypeById((value as SectorType).id).name);
    }
  };

  const isValid = (): boolean => {
    const existsAndIsValid =
      !!state.profileData.sectorId && LookupSectorTypeById(state.profileData.sectorId)?.id !== undefined;
    const isRequiredForPhase = LookupOperatingPhaseById(state.profileData.operatingPhase).sectorRequired;

    if (props.isSectorModal) {
      return existsAndIsValid;
    }

    return isRequiredForPhase ? existsAndIsValid : true;
  };

  const onValidation = (): void => setIsValid(isValid());

  RegisterForOnSubmit(isValid);

  return (
    <div className="text-field-width-default">
      <Autocomplete
        id="sectorId"
        options={SectorsOrdered}
        getOptionLabel={(sector: SectorType): string => {
          return sector.name;
        }}
        renderOption={(props, option, { selected }): JSX.Element => {
          return (
            <li {...props}>
              {selected ? (
                <div className="padding-top-1 padding-bottom-1" data-testid={option.id}>
                  <MenuOptionSelected>{option.name}</MenuOptionSelected>
                </div>
              ) : (
                <div className="padding-top-1 padding-bottom-1" data-testid={option.id}>
                  <MenuOptionUnselected>{option.name}</MenuOptionUnselected>
                </div>
              )}
            </li>
          );
        }}
        isOptionEqualToValue={(option: SectorType, value: SectorType): boolean => {
          return option.id === value.id;
        }}
        value={state.profileData.sectorId ? LookupSectorTypeById(state.profileData.sectorId) : null}
        onChange={handleSectorSelect}
        renderInput={(params): JSX.Element => {
          return (
            <TextField
              {...params}
              inputProps={{
                "aria-label": "Sector",
                "data-testid": "sectorId",
                ...params.inputProps,
              }}
              onBlur={onValidation}
              onSubmit={onValidation}
              value={searchText}
              onChange={handleChange}
              variant="outlined"
              error={isFormFieldInvalid}
              helperText={isFormFieldInvalid ? contentFromConfig.errorTextRequired : ""}
            />
          );
        }}
        openOnFocus
        clearOnEscape
        autoHighlight
      />
    </div>
  );
};
