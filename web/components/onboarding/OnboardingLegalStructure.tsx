import React, { ReactElement, useContext } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Content } from "@/components/Content";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { setHeaderRole } from "@/lib/utils/helpers";
import orderBy from "lodash.orderby";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.name;
    }
  );

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    setOnboardingData({
      ...state.onboardingData,
      legalStructureId: (event.target.value as string) || undefined,
    });
  };

  const makeLabel = (legalStructureId: string): ReactElement => (
    <div className="margin-bottom-2 margin-top-1" data-value={legalStructureId}>
      <b>{LookupLegalStructureById(legalStructureId).name}</b>
      <Content>{state.displayContent.legalStructure.optionContent[legalStructureId]}</Content>
    </div>
  );

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.legalStructure.contentMd}</Content>
      <div className="form-input-wide margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <RadioGroup
            aria-label="Legal structure"
            name="legal-structure"
            value={state.onboardingData.legalStructureId || ""}
            onChange={handleLegalStructure}
          >
            {LegalStructuresOrdered.map((legalStructure) => (
              <FormControlLabel
                style={{ alignItems: "flex-start" }}
                labelPlacement="end"
                key={legalStructure.id}
                data-testid={legalStructure.id}
                value={legalStructure.id}
                control={<Radio color="primary" />}
                label={makeLabel(legalStructure.id)}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};
