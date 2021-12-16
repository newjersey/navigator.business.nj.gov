import { Content } from "@/components/Content";
import { setHeaderRole } from "@/lib/utils/helpers";
import { OnboardingContext } from "@/pages/onboarding";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import orderBy from "lodash.orderby";
import React, { ReactElement, useContext } from "react";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.name;
    }
  );

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    setProfileData({
      ...state.profileData,
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
            value={state.profileData.legalStructureId || ""}
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
