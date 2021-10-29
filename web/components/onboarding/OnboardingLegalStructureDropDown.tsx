import React, { ReactElement, ReactNode, useContext } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
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

  const handleLegalStructure = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setOnboardingData({
        ...state.onboardingData,
        legalStructureId: event.target.value,
      });
    }
  };

  const renderOption = (legalStructureId: string): ReactElement => (
    <div className="padding-top-1 padding-bottom-1">
      {state.onboardingData.legalStructureId === legalStructureId ? (
        <MenuOptionSelected secondaryText={LookupLegalStructureById(legalStructureId).name}>
          {LookupLegalStructureById(legalStructureId).name}
        </MenuOptionSelected>
      ) : (
        <MenuOptionUnselected secondaryText={LookupLegalStructureById(legalStructureId).name}>
          {LookupLegalStructureById(legalStructureId).name}
        </MenuOptionUnselected>
      )}
    </div>
  );

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <span className="text-base">{state.displayContent.legalStructure.contentMd}</span>;
    }

    return <>{LookupLegalStructureById(value as string).name}</>;
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
            value={state.onboardingData.legalStructureId || ""}
            onChange={handleLegalStructure}
            name="legal-structure"
            inputProps={{
              "aria-label": "Legal structure",
              "data-testid": "legal-structure",
            }}
            renderValue={renderValue}
          >
            {LegalStructuresOrdered.map((legalStructure) => (
              <MenuItem key={legalStructure.id} value={legalStructure.id} data-testid={legalStructure.id}>
                {renderOption(legalStructure.id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
