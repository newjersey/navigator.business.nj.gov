import { Content } from "@/components/Content";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { setHeaderRole } from "@/lib/utils/helpers";
import { arrayOfSectors as sectors, LookupSectorTypeById, SectorType } from "@businessnjgovnavigator/shared/";
import { Autocomplete, TextField } from "@mui/material";
import orderBy from "lodash-es/orderBy";
import React, { ChangeEvent, ReactElement, useContext, useState } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
}

export const OnboardingSectors = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const SectorsOrdered: SectorType[] = orderBy(sectors, (SectorType: SectorType) => {
    return SectorType.name;
  });

  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
  };

  const handleSectorSelect = (event: React.SyntheticEvent<Element, Event>, value: SectorType | null) => {
    if (!value) {
      setSearchText("");
      setProfileData({ ...state.profileData, sectorId: "" });
    } else if (LookupSectorTypeById((value as SectorType).id).name) {
      setProfileData({ ...state.profileData, sectorId: (value as SectorType).id });
      setSearchText(LookupSectorTypeById((value as SectorType).id).name);
    }
  };

  const onValidation = (): void => {
    let invalid = true;
    if (state.profileData.sectorId) {
      invalid = !LookupSectorTypeById(state.profileData.sectorId).id;
    }
    props.onValidation("sectorId", invalid);
  };

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].sectorId.header}
      </Content>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].sectorId.description}
      </Content>
      <div className="form-input margin-top-2">
        <Autocomplete
          id="sectorId"
          options={SectorsOrdered}
          getOptionLabel={(sector: SectorType) => sector.name}
          renderOption={(props, option, { selected }) => (
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
          )}
          isOptionEqualToValue={(option: SectorType, value: SectorType) => option.id === value.id}
          value={state.profileData.sectorId ? LookupSectorTypeById(state.profileData.sectorId) : null}
          onChange={handleSectorSelect}
          renderInput={(params) => (
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
              placeholder={Config.profileDefaults[state.flow].sectorId.placeholder}
              error={props.fieldStates.sectorId.invalid}
              helperText={
                props.fieldStates.sectorId.invalid
                  ? Config.profileDefaults[state.flow].sectorId.errorTextRequired
                  : " "
              }
            />
          )}
          fullWidth
          openOnFocus
          clearOnEscape
          autoHighlight
        />
      </div>
    </>
  );
};
