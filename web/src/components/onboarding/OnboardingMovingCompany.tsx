import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const OnboardingMovingCompany = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleMovingCompanySelection = (event: React.ChangeEvent<{ name: string; value: unknown }>) => {
    setProfileData({ ...state.profileData, interstateTransport: event.target.value === "true" });
  };

  return (
    <>
      <FormControl>
        <RadioGroup
          aria-label="Moves Goods Across State Lines"
          name="interstate-transport"
          value={state.profileData.interstateTransport}
          onChange={handleMovingCompanySelection}
          row
        >
          <FormControlLabel
            labelPlacement="end"
            data-testid="interstate-transport-true"
            value={true}
            control={<Radio />}
            label={Config.profileDefaults[state.flow].interstateTransport.radioButtonYesText}
          />
          <FormControlLabel
            labelPlacement="end"
            data-testid="interstate-transport-false"
            value={false}
            control={<Radio />}
            label={Config.profileDefaults[state.flow].interstateTransport.radioButtonNoText}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};
