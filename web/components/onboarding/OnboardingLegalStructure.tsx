import React, { ReactElement, ReactNode, useContext } from "react";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { ALL_LEGAL_STRUCTURES, LegalStructure } from "../../lib/types/types";
import { LegalStructureLookup } from "../../display-content/LegalStructureLookup";
import { Content } from "../Content";
import { MenuOptionSelected } from "../MenuOptionSelected";
import { MenuOptionUnselected } from "../MenuOptionUnselected";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  const renderOption = (legalStructure: LegalStructure): ReactElement =>
    state.onboardingData.legalStructure === legalStructure ? (
      <MenuOptionSelected>{LegalStructureLookup[legalStructure]}</MenuOptionSelected>
    ) : (
      <MenuOptionUnselected>{LegalStructureLookup[legalStructure]}</MenuOptionUnselected>
    );

  return (
    <>
      <Content>{state.displayContent.legalStructure.contentMd}</Content>
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
            renderValue={(value: unknown): ReactNode => <>{LegalStructureLookup[value as LegalStructure]}</>}
          >
            <MenuItem value="">&nbsp;</MenuItem>
            {ALL_LEGAL_STRUCTURES.map((legalStructure) => (
              <MenuItem key={legalStructure} value={legalStructure}>
                {renderOption(legalStructure)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
