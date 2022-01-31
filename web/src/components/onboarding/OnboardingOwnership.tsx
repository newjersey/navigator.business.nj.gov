import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { LookupOwnershipTypeById, OwnershipType, OwnershipTypes } from "@businessnjgovnavigator/shared";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  headerAriaLevel?: number;
}

export const OnboardingOwnership = ({ headerAriaLevel = 2 }: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setProfileData({
      ...state.profileData,
      ownershipTypeIds: value,
    });
  };
  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <>
      <div role="heading" aria-level={headerAriaLevel} className="h3-styling margin-bottom-2">
        {state.displayContent.ownership.headingBolded}{" "}
        <span className="text-light">{state.displayContent.ownership.headingNotBolded}</span>
      </div>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.ownership.contentMd}</Content>
      <div className="form-input margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            displayEmpty
            value={state.profileData.ownershipTypeIds}
            onChange={handleChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <div className="text-base">{state.displayContent.ownership.placeholder}</div>;
              }

              return selected.map((it) => LookupOwnershipTypeById(it).name).join(", ");
            }}
            inputProps={{
              "aria-label": "Ownership",
              "data-testid": "ownership",
            }}
          >
            {OwnershipTypes.map((ownership: OwnershipType) => (
              <MenuItem key={ownership.id} value={ownership.id} data-testid={ownership.id}>
                <Checkbox checked={state.profileData.ownershipTypeIds.indexOf(ownership.id) > -1} />
                <ListItemText className="text-wrap" primary={ownership.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
