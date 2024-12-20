import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const IsVeteranNonprofit = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const fieldName = "isVeteranNonprofit";

  return (
    <FormationRadio
      fieldName={fieldName}
      title={Config.formation.fields.isVeteranNonprofit.description}
      values={["true", "false"]}
      onChange={(e): void => {
        const valueToSave = JSON.parse(e.target.value);
        setFormationFormData({
          ...state.formationFormData,
          [fieldName]: valueToSave,
        });
        setFieldsInteracted([fieldName]);
      }}
      errorMessage={Config.formation.fields.isVeteranNonprofit.error}
    />
  );
};
