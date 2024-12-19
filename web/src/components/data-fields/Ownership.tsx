import { ProfileDataContext } from "@/contexts/profileDataContext";
import {
  arrayOfOwnershipTypes,
  LookupOwnershipTypeById,
  OwnershipType,
} from "@businessnjgovnavigator/shared";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

export const Ownership = (): ReactElement<any> => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const NONE_OF_THE_ABOVE = "none";

  const handleChange = (event: SelectChangeEvent<string[]>): void => {
    let values: string[] =
      typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    const justSelectedValue = values[values.length - 1];
    if (justSelectedValue === NONE_OF_THE_ABOVE) {
      values = [NONE_OF_THE_ABOVE];
    } else {
      values = values.filter((it) => it !== NONE_OF_THE_ABOVE);
    }

    setProfileData({
      ...state.profileData,
      ownershipTypeIds: values,
    });
  };

  return (
    <>
      <div className="text-field-width-default">
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            displayEmpty
            value={state.profileData.ownershipTypeIds}
            onChange={handleChange}
            renderValue={(selected): ReactNode => {
              if (selected.length === 0) {
                return <></>;
              }

              return selected
                .map((it) => {
                  return LookupOwnershipTypeById(it).name;
                })
                .join(", ");
            }}
            inputProps={{
              "aria-label": "Ownership",
              "data-testid": "ownership",
            }}
          >
            {arrayOfOwnershipTypes.map((ownership: OwnershipType) => {
              return (
                <MenuItem key={ownership.id} value={ownership.id} data-testid={ownership.id}>
                  <Checkbox checked={state.profileData.ownershipTypeIds.includes(ownership.id)} />
                  <ListItemText className="text-wrap padding-y-1" primary={ownership.name} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
