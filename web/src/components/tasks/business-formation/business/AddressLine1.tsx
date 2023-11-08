import {ReactElement, useContext} from "react";
import {BusinessFormationTextField} from "@/components/tasks/business-formation/BusinessFormationTextField";
import {isValidWithAssociatedFields} from "@/components/tasks/business-formation/validation/isValidWithAssociatedFields";
import {FormationField} from "@/components/tasks/business-formation/FormationField";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {BusinessFormationContext} from "@/contexts/businessFormationContext";
import {templateEval} from "@/lib/utils/helpers";

export const AddressLine1 = (): ReactElement => {
  const { Config } = useConfig()
  const { state } = useContext(BusinessFormationContext);
  const MAX_LEN = 35

  const isTooLong = (value: string | undefined): boolean => {
    if (!value) return false;
    return value.length > MAX_LEN;
  }

  const isForeign = (): boolean => {
    return state.formationFormData.businessLocationType !== "NJ";
  };

  const getErrorMessage = (): string => {
    const value = state.formationFormData.addressLine1
    if (isTooLong(value)) {
      return templateEval(Config.formation.general.maximumLengthErrorText, {
        field: Config.formation.fields.addressLine1.label,
        maxLen: MAX_LEN.toString(),
      });
    }

    if (!isForeign() && !isValidWithAssociatedFields({
      value,
      formationFormData: state.formationFormData,
      associatedFields: ["addressZipCode", "addressMunicipality"]
    })) {
      return Config.formation.general.partialAddressErrorText
    }

    return Config.formation.fields.addressLine1.error
  }

  return (
    <FormationField fieldName="addressLine1">
      <BusinessFormationTextField
        label={Config.formation.fields.addressLine1.label}
        fieldName="addressLine1"
        className={"margin-bottom-2"}
        errorBarType="ALWAYS"
        additionalValidationIsValid={(value: string | undefined): boolean => {
          if (isForeign()) {
            return !!value && !isTooLong(value);
          }

          if (isTooLong(value)) {
            return false
          }

          return isValidWithAssociatedFields({
            value,
            formationFormData: state.formationFormData,
            associatedFields: ["addressZipCode", "addressMunicipality"]
          })
        }}
        revalidateOnFields={[state.formationFormData.addressZipCode, state.formationFormData.addressMunicipality]}
        validationText={getErrorMessage()}
      />
    </FormationField>
  )
}