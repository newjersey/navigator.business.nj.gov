import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import {
  LegalStructure,
  LegalStructures,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { FormControl, FormHelperText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { orderBy } from "lodash";
import { ReactElement, ReactNode, useContext } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  disabled?: boolean;
  fullWidth?: boolean;
}

export const LegalStructureDropDown = <T,>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
    "legalStructureId",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  const isValid = (): boolean => state.profileData.legalStructureId !== undefined;

  const performValidation = (): void => {
    setIsValid(isValid());
  };

  RegisterForOnSubmit(isValid);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.name;
    },
  );

  const handleLegalStructure = (event: SelectChangeEvent): void => {
    if (event.target.value) {
      setProfileData({
        ...state.profileData,
        legalStructureId: event.target.value,
      });
      setIsValid(true);
    }
  };

  const renderOption = (legalStructureId: string): ReactElement => {
    return (
      <div className="padding-top-1 padding-bottom-1">
        {state.profileData.legalStructureId === legalStructureId ? (
          <MenuOptionSelected>{LookupLegalStructureById(legalStructureId).name}</MenuOptionSelected>
        ) : (
          <MenuOptionUnselected>
            {LookupLegalStructureById(legalStructureId).name}
          </MenuOptionUnselected>
        )}
      </div>
    );
  };

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <></>;
    }

    return <>{LookupLegalStructureById(value as string).name}</>;
  };

  return (
    <>
      <div className={`${props.fullWidth ? "" : "text-field-width-default"}`}>
        <FormControl variant="outlined" fullWidth error={isFormFieldInvalid}>
          <Select
            fullWidth
            displayEmpty
            value={state.profileData.legalStructureId || ""}
            onChange={handleLegalStructure}
            onBlur={performValidation}
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
                <MenuItem
                  key={legalStructure.id}
                  value={legalStructure.id}
                  data-testid={legalStructure.id}
                >
                  {renderOption(legalStructure.id)}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormHelperText className={"text-error-dark"}>
          {isFormFieldInvalid &&
            Config.profileDefaults.fields.legalStructureId.default.errorTextRequired}
        </FormHelperText>
      </div>
    </>
  );
};
