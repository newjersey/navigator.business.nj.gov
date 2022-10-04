import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { CarServiceType } from "@businessnjgovnavigator/shared/profileData";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const OnboardingCarService = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleCarServiceSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      carService: event.target.value as CarServiceType,
    });
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label="Car Service Options"
          name="car-service"
          value={state.profileData.carService ?? ""}
          onChange={handleCarServiceSelection}
        >
          <FormControlLabel
            aria-label="Car Service Type - Standard (Taxis, Limos, etc.)"
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="car-service-standard"
            value="STANDARD"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].carService.radioButtonStandardText}
          />
          <FormControlLabel
            aria-label="Car Service Type - High Capacity (15+ Passenger Vehicles)"
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="car-service-high-capacity"
            value="HIGH_CAPACITY"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].carService.radioButtonHighCapacityText}
          />
          <FormControlLabel
            aria-label="Car Service Type - Both"
            style={{ marginTop: ".75rem", alignItems: "flex-start", marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="car-service-both"
            value="BOTH"
            control={<Radio color="primary" sx={{ paddingTop: "0px" }} />}
            label={Config.profileDefaults[state.flow].carService.radioButtonBothText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};
