import React, { ReactElement, useContext } from "react";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { ALL_LEGAL_STRUCTURES, LegalStructure } from "../../lib/types/types";
import { LegalStructureLookup } from "../../display-content/LegalStructureLookup";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  return (
    <>
      <div
        className="usa-prose"
        dangerouslySetInnerHTML={{ __html: state.displayContent.legalStructure.contentHtml }}
      />
      <div className="form-input margin-top-2">
        <FormControl variant="outlined" fullWidth>
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
