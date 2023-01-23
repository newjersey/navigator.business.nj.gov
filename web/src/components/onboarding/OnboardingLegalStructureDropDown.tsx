import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { FormControl, FormHelperText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { orderBy } from "lodash";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  disabled?: boolean;
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldStates?: ProfileFieldErrorMap;
}

export const OnboardingLegalStructureDropdown = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["legalStructureId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "legalStructureId",
    });

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
      if (props.onValidation) {
        props.onValidation("legalStructureId", false);
      }
    }
  };

  const renderOption = (legalStructureId: string): ReactElement => {
    return (
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
  };

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <span className="text-base">{contentFromConfig.placeholder}</span>;
    }

    return <>{LookupLegalStructureById(value as string).name}</>;
  };

  return (
    <>
      <div className="form-input margin-top-2">
        <FormControl variant="outlined" fullWidth error={props.fieldStates?.legalStructureId.invalid}>
          <Select
            fullWidth
            displayEmpty
            value={state.profileData.legalStructureId || ""}
            onChange={handleLegalStructure}
            name="legal-structure"
            inputProps={{
              "aria-label": "Business structure",
              "data-testid": "legal-structure",
            }}
            renderValue={renderValue}
            disabled={props.disabled}
          >
            {LegalStructuresOrdered.map((legalStructure) => {
              return (
                <MenuItem key={legalStructure.id} value={legalStructure.id} data-testid={legalStructure.id}>
                  {renderOption(legalStructure.id)}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormHelperText className={"text-error-dark"}>
          {props.fieldStates?.legalStructureId.invalid &&
            Config.profileDefaults.fields.legalStructureId.default.errorTextRequired}
        </FormHelperText>
      </div>
    </>
  );
};
