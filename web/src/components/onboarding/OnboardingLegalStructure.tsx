/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { orderBy } from "lodash";
import React, { ReactElement, useContext } from "react";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.onboardingOrder;
    }
  );

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    setProfileData({
      ...state.profileData,
      legalStructureId: (event.target.value as string) || undefined,
    });
  };

  const makeLabel = (legalStructureId: string): ReactElement => {
    const supportingText =
      (Config.profileDefaults[state.flow].legalStructureId.optionContent as any)[legalStructureId] ?? "";
    return (
      <div className="margin-bottom-2 margin-top-1" data-value={legalStructureId}>
        <div className={supportingText === "" ? "" : "text-bold"}>
          {LookupLegalStructureById(legalStructureId).name}
        </div>
        <Content>{supportingText}</Content>
      </div>
    );
  };

  return (
    <>
      <div className="form-input-wide margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <RadioGroup
            aria-label="Business structure"
            name="legal-structure"
            value={state.profileData.legalStructureId || ""}
            onChange={handleLegalStructure}
          >
            {LegalStructuresOrdered.map((legalStructure) => {
              return (
                <FormControlLabel
                  aria-label={legalStructure.id}
                  style={{ alignItems: "flex-start" }}
                  labelPlacement="end"
                  key={legalStructure.id}
                  data-testid={legalStructure.id}
                  value={legalStructure.id}
                  control={<Radio color="primary" />}
                  label={makeLabel(legalStructure.id)}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};
