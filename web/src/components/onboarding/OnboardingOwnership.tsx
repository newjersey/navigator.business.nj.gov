import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  arrayOfOwnershipTypes,
  LookupOwnershipTypeById,
  OwnershipType,
} from "@businessnjgovnavigator/shared/";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, useContext } from "react";

export const OnboardingOwnership = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setProfileData({
      ...state.profileData,
      ownershipTypeIds: value,
    });
  };

  return (
    <>
      <div className="form-input margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            displayEmpty
            value={state.profileData.ownershipTypeIds}
            onChange={handleChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <div className="text-base">
                    {Config.profileDefaults[state.flow].ownershipTypeIds.placeholder}
                  </div>
                );
              }

              return selected.map((it) => LookupOwnershipTypeById(it).name).join(", ");
            }}
            inputProps={{
              "aria-label": "Ownership",
              "data-testid": "ownership",
            }}
          >
            {arrayOfOwnershipTypes.map((ownership: OwnershipType) => (
              <MenuItem key={ownership.id} value={ownership.id} data-testid={ownership.id}>
                <Checkbox checked={state.profileData.ownershipTypeIds.includes(ownership.id)} />
                <ListItemText className="text-wrap" primary={ownership.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
