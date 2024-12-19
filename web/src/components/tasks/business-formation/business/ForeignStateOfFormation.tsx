import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { StateObject } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ForeignStateOfFormation = (): ReactElement<any> => {
  const FIELD = "foreignStateOfFormation";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (stateObject: StateObject | undefined): void => {
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
        error={doesFieldHaveError(FIELD)}
        onSelect={handleChange}
        includeOutsideUSA={true}
      />
    </>
  );
};
