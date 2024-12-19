import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: FormationTextField;
  label: string;
  maxChars: number;
}

export const FormationTextArea = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <div className="margin-top-1">
      <FormationField fieldName={props.fieldName}>
        <BusinessFormationTextField
          fieldName={props.fieldName}
          required={true}
          errorBarType="ALWAYS"
          validationText={Config.formation.general.genericErrorText}
          label={props.label}
          fieldOptions={{
            multiline: true,
            rows: 3,
            className: "override-padding",
            inputProps: {
              maxLength: props.maxChars,
              sx: {
                padding: "1rem",
              },
            },
          }}
        />
      </FormationField>
      <div className="text-base-dark margin-top-1 margin-bottom-2">
        {(state.formationFormData[props.fieldName] as string)?.length ?? 0} / {props.maxChars}{" "}
        {Config.formation.general.charactersLabel}
      </div>
    </div>
  );
};
