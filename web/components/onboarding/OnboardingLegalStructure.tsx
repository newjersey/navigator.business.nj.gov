import React, { ReactElement, useContext } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { LegalStructure } from "../../lib/types/types";
import { Content } from "../Content";
import {
  ALL_LEGAL_STRUCTURES_ORDERED,
  LegalStructureLookup,
} from "../../display-content/LegalStructureLookup";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructure: (event.target.value as LegalStructure) || undefined,
    });
  };

  const makeLabel = (legalStructure: LegalStructure) => (
    <div className="margin-bottom-2 margin-top-1" data-value={legalStructure}>
      <b>{LegalStructureLookup[legalStructure]}</b>
      <Content>{state.displayContent.legalStructure.optionContent[legalStructure]}</Content>
    </div>
  );

  return (
    <>
      <Content>{state.displayContent.legalStructure.contentMd}</Content>
      <div className="form-input-wide margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <RadioGroup
            aria-label="Legal structure"
            name="legal-structure"
            value={state.onboardingData.legalStructure || ""}
            onChange={handleLegalStructure}
          >
            {ALL_LEGAL_STRUCTURES_ORDERED.map((legalStructure) => (
              <FormControlLabel
                style={{ alignItems: "flex-start" }}
                labelPlacement="end"
                key={legalStructure}
                data-testid={legalStructure}
                value={legalStructure}
                control={<Radio color="primary" />}
                label={makeLabel(legalStructure)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};
