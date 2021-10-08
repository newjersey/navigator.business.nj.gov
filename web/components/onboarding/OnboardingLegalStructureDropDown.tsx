import React, { ReactElement, ReactNode, useContext } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { OnboardingContext } from "@/pages/onboarding";
import { LegalStructure } from "@/lib/types/types";
import { Content } from "@/components/Content";
import { ALL_LEGAL_STRUCTURES_ORDERED, LegalStructureLookup } from "@/display-content/LegalStructureLookup";
import { setHeaderRole } from "@/lib/utils/helpers";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLegalStructure = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setOnboardingData({
        ...state.onboardingData,
        legalStructure: event.target.value as LegalStructure,
      });
    }
  };

  const renderOption = (LegalStructure: LegalStructure): ReactElement => (
    <div className="padding-top-1 padding-bottom-1">
      {state.onboardingData.legalStructure === LegalStructure ? (
        <MenuOptionSelected secondaryText={LegalStructureLookup[LegalStructure]}>
          {LegalStructureLookup[LegalStructure]}
        </MenuOptionSelected>
      ) : (
        <MenuOptionUnselected secondaryText={LegalStructureLookup[LegalStructure]}>
          {LegalStructureLookup[LegalStructure]}
        </MenuOptionUnselected>
      )}
    </div>
  );

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <span className="text-base">{state.displayContent.legalStructure.contentMd}</span>;
    }

    return <>{LegalStructureLookup[value as LegalStructure]}</>;
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.legalStructure.contentMd}</Content>
      <div className="form-input-wide margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <Select
            fullWidth
            displayEmpty
            value={state.onboardingData.legalStructure || ""}
            onChange={handleLegalStructure}
            name="legal-structure"
            inputProps={{
              "aria-label": "Legal structure",
              "data-testid": "legal-structure",
            }}
            renderValue={renderValue}
          >
            {ALL_LEGAL_STRUCTURES_ORDERED.map((legalStructure) => (
              <MenuItem key={legalStructure} value={legalStructure} data-testid={legalStructure}>
                {renderOption(legalStructure)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
