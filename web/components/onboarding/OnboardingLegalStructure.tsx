import React, { ReactElement, useContext } from "react";
import { createStyles, FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
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
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  return (
    <>
      <h3>{state.displayContent.legalStructure.title}</h3>
      <p>{state.displayContent.legalStructure.description}</p>
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
    </>
  );
};
