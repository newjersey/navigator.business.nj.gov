import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { arrayOfSectors as sectors, LookupSectorTypeById, SectorType } from "@businessnjgovnavigator/shared/";
import { Autocomplete, TextField } from "@mui/material";
import { orderBy } from "lodash";
import React, { ChangeEvent, ReactElement, useContext, useState } from "react";

export const OnboardingSectors = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    "sectorId",
    profileFormContext,
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

  const handleSectorSelect = (event: React.SyntheticEvent<Element, Event>, value: SectorType | null) => {
    if (!value) {
      setSearchText("");
      setProfileData({ ...state.profileData, sectorId: "" });
    } else if (LookupSectorTypeById((value as SectorType).id).name) {
      setProfileData({ ...state.profileData, sectorId: (value as SectorType).id });
      setSearchText(LookupSectorTypeById((value as SectorType).id).name);
    }
  };

  const isValid = () =>
    !!state.profileData.sectorId && LookupSectorTypeById(state.profileData.sectorId)?.id != undefined;

  const onValidation = (): void => Validate(!isValid());

  RegisterForOnSubmit(isValid);

  return (
    <>
      <div className="form-input margin-top-2">
        <Autocomplete
          id="sectorId"
          options={SectorsOrdered}
          getOptionLabel={(sector: SectorType) => {
            return sector.name;
          }}
          renderOption={(props, option, { selected }) => {
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
          isOptionEqualToValue={(option: SectorType, value: SectorType) => {
            return option.id === value.id;
          }}
          value={state.profileData.sectorId ? LookupSectorTypeById(state.profileData.sectorId) : null}
          onChange={handleSectorSelect}
          renderInput={(params) => {
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
                error={isFormFieldInValid}
                helperText={isFormFieldInValid ? contentFromConfig.errorTextRequired : ""}
              />
            );
          }}
          fullWidth
          openOnFocus
          clearOnEscape
          autoHighlight
        />
      </div>
    </>
  );
};
