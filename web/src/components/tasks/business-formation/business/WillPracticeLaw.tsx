import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext, useState } from "react";

export const WillPracticeLaw = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const fieldName = "willPracticeLaw";
  const [alert, setAlert] = useState<boolean>(false);

  return (
    <>
      <FormationRadio
        fieldName={fieldName}
        title={Config.formation.fields.willPracticeLaw.label}
        subtitle={Config.formation.fields.willPracticeLaw.subtitle}
        values={["true", "false"]}
        onChange={(e): void => {
          const valueToSave = JSON.parse(e.target.value);
          const newFormationObject = {
            ...state.formationFormData,
            [fieldName]: valueToSave,
          };
          if (state.formationFormData.businessSuffix) {
            newFormationObject.businessSuffix = undefined;
            setFieldsInteracted(["businessSuffix"], { setToUninteracted: true });
          }
          setFormationFormData(newFormationObject);
          setFieldsInteracted([fieldName]);
          setAlert(true);
        }}
        errorMessage={Config.formation.fields.willPracticeLaw.error}
      />
      {alert && (
        <SnackbarAlert variant={"info"} close={(): void => setAlert(false)} isOpen={alert}>
          {Config.formation.fields.businessSuffix.optionsUpdatedSnackbarAlert}
        </SnackbarAlert>
      )}
    </>
  );
};
