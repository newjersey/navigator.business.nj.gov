import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
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
  const NONE_OF_THE_ABOVE = "none";

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["ownershipTypeIds"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "ownershipTypeIds",
    });

  const handleChange = (event: SelectChangeEvent<string[]>) => {
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
      <div className="form-input margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            displayEmpty
            value={state.profileData.ownershipTypeIds}
            onChange={handleChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <div className="text-base">{contentFromConfig.placeholder}</div>;
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
                  <ListItemText className="text-wrap" primary={ownership.name} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
