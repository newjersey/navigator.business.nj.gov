import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { StateObject } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";
import {useMountEffect} from "@/lib/utils/helpers";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";

export const ForeignStateOfFormation = (): ReactElement => {
  const FIELD = "foreignStateOfFormation";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers("foreignGoodStandingFile", FormationFormContext);

  const isValid = (value: string | undefined): boolean => {
    return value !== undefined
  };

  RegisterForOnSubmit(() => isValid(state.formationFormData[FIELD]));
  const runValidation = (value: string | undefined): void => setIsValid(isValid(value));

  useMountEffect(() => {
    runValidation(state.formationFormData[FIELD])
  })

  const handleChange = (stateObject: StateObject | undefined): void => {
    runValidation(stateObject?.name)
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        foreignStateOfFormation: stateObject?.name,
      };
    });
  };

  return (
    <>
      <strong>
        <ModifiedContent>{Config.formation.fields.foreignStateOfFormation.label}</ModifiedContent>
      </strong>
      <StateDropdown
        fieldName="foreignStateOfFormation"
        useFullName
        excludeNJ
        onValidation={(): void => setFieldsInteracted([FIELD])}
        value={state.formationFormData.foreignStateOfFormation}
        validationText={Config.formation.fields.foreignStateOfFormation.error}
        required
        error={isFormFieldInvalid}
        onSelect={handleChange}
        includeOutsideUSA={true}
      />
    </>
  );
};
