import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { LookupOwnershipTypeById, OwnershipTypes } from "@businessnjgovnavigator/shared";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingOwnership = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setProfileData({
      ...state.profileData,
      ownershipTypeIds: value,
    });
  };
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-2">
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
                return <div className="text-disabled-dark">{state.displayContent.ownership.placeholder}</div>;
              }

              return selected.map((it) => LookupOwnershipTypeById(it).name).join(", ");
            }}
            inputProps={{
              "aria-label": "Ownership",
              "data-testid": "ownership",
            }}
          >
            {OwnershipTypes.map((cert) => (
              <MenuItem key={cert.id} value={cert.id} data-testid={cert.id}>
                <Checkbox checked={state.profileData.ownershipTypeIds.indexOf(cert.id) > -1} />
                <ListItemText className="text-wrap" primary={cert.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
