import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {isBusinessStartDateValid} from "@/components/tasks/business-formation/business/BusinessDateValidators";
import {useMountEffect} from "@/lib/utils/helpers";

const fieldName = "isVeteranNonprofit";
export const IsVeteranNonprofit = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

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
      }}
      errorMessage={Config.formation.fields.isVeteranNonprofit.error}
    />
  );
};
