import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const WillPracticeLaw = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const fieldName = "willPracticeLaw";

  return (
    <FormationRadio
      fieldName={fieldName}
      title={Config.formation.fields.willPracticeLaw.label}
      values={["true", "false"]}
      onChange={(e): void => {
        const valueToSave = JSON.parse(e.target.value);
        setFormationFormData({
          ...state.formationFormData,
          [fieldName]: valueToSave,
        });
        setFieldsInteracted([fieldName]);
      }}
      errorMessage={Config.formation.fields.willPracticeLaw.error}
    />
  );
};
