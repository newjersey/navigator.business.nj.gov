import React, { ReactElement, useContext } from "react";
import { createStyles, FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
import { OnboardingButtonGroup } from "./OnboardingButtonGroup";
import { OnboardingContext } from "../../pages/onboarding";
import { ALL_LEGAL_STRUCTURES, LegalStructure } from "../../lib/types/types";
import { LegalStructureLookup } from "../../display-content/LegalStructureLookup";

const useStyles = makeStyles(() =>
  createStyles({
    formControl: {
      minWidth: "20rem",
    },
  })
);

export const OnboardingLegalStructure = (): ReactElement => {
  const classes = useStyles();
  const { state, setOnboardingData, onSubmit } = useContext(OnboardingContext);

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  return (
    <form onSubmit={onSubmit} className="usa-prose">
      <h3>Legal Structure</h3>
      <p>Which legal structure can best describe your company?</p>
      <div className="form-input">
        <FormControl variant="outlined" className={classes.formControl}>
          <Select
            fullWidth
            value={state.onboardingData.legalStructure || ""}
            onChange={handleLegalStructure}
            inputProps={{
              "aria-label": "Legal structure",
              "data-testid": "legal-structure",
            }}
          >
            <MenuItem value="">&nbsp;</MenuItem>
            {ALL_LEGAL_STRUCTURES.map((legalStructure) => (
              <MenuItem key={legalStructure} value={legalStructure}>
                {LegalStructureLookup[legalStructure]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
      <OnboardingButtonGroup />
    </form>
  );
};
