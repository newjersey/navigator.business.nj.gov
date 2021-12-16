import { Content } from "@/components/Content";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { setHeaderRole } from "@/lib/utils/helpers";
import { OnboardingContext } from "@/pages/onboarding";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import orderBy from "lodash.orderby";
import React, { ReactElement, ReactNode, useContext } from "react";

export const OnboardingLegalStructure = (): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.name;
    }
  );

  const handleLegalStructure = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setProfileData({
        ...state.profileData,
        legalStructureId: event.target.value,
      });
    }
  };

  const renderOption = (legalStructureId: string): ReactElement => (
    <div className="padding-top-1 padding-bottom-1">
      {state.profileData.legalStructureId === legalStructureId ? (
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
            value={state.profileData.legalStructureId || ""}
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
