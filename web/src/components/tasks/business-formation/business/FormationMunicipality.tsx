import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { Municipality } from "@businessnjgovnavigator/shared/";
import {ReactElement, useCallback, useContext, useEffect} from "react";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {useMountEffect} from "@/lib/utils/helpers";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {WithErrorBar} from "@/components/WithErrorBar";
import {isValidWithAssociatedFields} from "@/components/tasks/business-formation/validation/isValidWithAssociatedFields";

const FIELD = "addressMunicipality"
export const FormationMunicipality = (): ReactElement => {
  const { Config } = useConfig()
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { municipalities } = useContext(MunicipalitiesContext);

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(FIELD, FormationFormContext);

  const isValid = useCallback((value: Municipality | undefined): boolean => {
    return isValidWithAssociatedFields({
      value,
      formationFormData: state.formationFormData,
      associatedFields: ["addressZipCode", "addressLine1"]
    })
  }, [state.formationFormData]);

  RegisterForOnSubmit(() => isValid(state.formationFormData[FIELD]));
  const runValidation = (value: Municipality | undefined): void => setIsValid(isValid(value));

  useMountEffect(() => {
    runValidation(state.formationFormData[FIELD])
  })

  useEffect(() => {
    runValidation(state.formationFormData[FIELD])
  }, [state.formationFormData.addressZipCode, state.formationFormData.addressLine1])

  const onSelect = (value: Municipality | undefined): void => {
    runValidation(value)
    setFormationFormData((previousFormationFormData) => {
      return { ...previousFormationFormData, addressMunicipality: value };
    });
  };

  return (
    <WithErrorBar hasError={isFormFieldInvalid} type="MOBILE-ONLY">
      <span className="text-bold">{Config.formation.fields.addressMunicipality.label}</span>
      <MunicipalityDropdown
        onValidation={(): void => setFieldsInteracted([FIELD])}
        municipalities={municipalities}
        fieldName={FIELD}
        error={isFormFieldInvalid}
        validationLabel="Error"
        value={state.formationFormData.addressMunicipality}
        onSelect={onSelect}
        helperText={Config.formation.general.partialAddressErrorText}
      />
    </WithErrorBar>
  );
};
