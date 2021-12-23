import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { Certifications, LookupCertificationById } from "@businessnjgovnavigator/shared";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCertifications = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;
    setProfileData({
      ...state.profileData,
      certificationIds: value,
    });
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.certifications.contentMd}</Content>
      <div className="form-input margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <Select
            multiple
            displayEmpty
            value={state.profileData.certificationIds}
            onChange={handleChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <div className="text-disabled-dark">{state.displayContent.certifications.placeholder}</div>
                );
              }

              return selected.map((it) => LookupCertificationById(it).name).join(", ");
            }}
            inputProps={{
              "aria-label": "Certifications",
              "data-testid": "certifications",
            }}
          >
            {Certifications.map((cert) => (
              <MenuItem key={cert.id} value={cert.id} data-testid={cert.id}>
                <Checkbox checked={state.profileData.certificationIds.indexOf(cert.id) > -1} />
                <ListItemText className="text-wrap" primary={cert.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
