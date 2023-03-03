import { Content } from "@/components/Content";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { StateObject } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ForeignStateOfFormation = (): ReactElement => {
  const FIELD = "foreignStateOfFormation";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const handleChange = (stateObject: StateObject | undefined) => {
    setFieldsInteracted([FIELD]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        foreignStateOfFormation: stateObject?.name,
      };
    });
  };

  return (
    <>
      <div className="flex margin-bottom-2">
        <Content>{Config.formation.fields.foreignStateOfFormation.label}</Content>
      </div>
      <div className="margin-bottom-2">
        <StateDropdown
          fieldName="foreignStateOfFormation"
          useFullName
          excludeNJ
          onValidation={() => setFieldsInteracted([FIELD])}
          value={state.formationFormData.foreignStateOfFormation}
          validationText={Config.formation.fields.foreignStateOfFormation.error}
          required
          error={doesFieldHaveError(FIELD)}
          onSelect={handleChange}
          className={"margin-top-2"}
        />
      </div>
    </>
  );
};
