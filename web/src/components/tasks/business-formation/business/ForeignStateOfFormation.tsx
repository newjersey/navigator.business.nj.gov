import { Content } from "@/components/Content";
import { StateDropdown } from "@/components/StateDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { StateObject } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ForeignStateOfFormation = (): ReactElement => {
  const FIELD = "foreignStateOfFormation";
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
        <Content>{state.displayContent.foreignStateOfFormationHeader.contentMd}</Content>
      </div>
      <div className="margin-bottom-2">
        <StateDropdown
          fieldName="foreignStateOfFormation"
          useFullName
          excludeNJ
          onValidation={() => setFieldsInteracted([FIELD])}
          value={state.formationFormData.foreignStateOfFormation}
          placeholder={state.displayContent.foreignStateOfFormationHeader.placeholder}
          validationText={state.displayContent.foreignStateOfFormationHeader.errorText}
          required
          error={doesFieldHaveError(FIELD)}
          onSelect={handleChange}
          className={"margin-top-2"}
        />
      </div>
    </>
  );
};
