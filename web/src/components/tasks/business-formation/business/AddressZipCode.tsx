import {BusinessFormationTextField} from "@/components/tasks/business-formation/BusinessFormationTextField";
import {isValidWithAssociatedFields} from "@/components/tasks/business-formation/validation/isValidWithAssociatedFields";
import {FormationField} from "@/components/tasks/business-formation/FormationField";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {useContext} from "react";
import {BusinessFormationContext} from "@/contexts/businessFormationContext";
import {isZipCodeUs} from "@/lib/domain-logic/isZipCodeUs";
import {isZipCodeIntl} from "@/lib/domain-logic/isZipCodeIntl";
import {isZipCodeNj} from "@/lib/domain-logic/isZipCodeNj";

export const AddressZipCode = () => {
  const { Config } = useConfig()
  const { state } = useContext(BusinessFormationContext);

  const isForeign = (): boolean => {
    return state.formationFormData.businessLocationType !== "NJ";
  };

  const isValid = (value: string | undefined) => {
    const exists = !!value;
    let inRange = false;

    if (isForeign()) {
      switch (state.formationFormData.businessLocationType) {
        case "US":
          inRange = isZipCodeUs(value);
          break;
        case "INTL":
          inRange = isZipCodeIntl(value);
          break;
      }
      const isValid = exists && inRange;
      return { ...errorState, hasError: !isValid, label: Config.formation.fields.addressZipCode.error };
    }

    const partialAddressError = fieldWithAssociatedFields({
      associatedFields: ["addressMunicipality", "addressLine1"],
      label: Config.formation.general.partialAddressErrorText,
    });

    inRange = isZipCodeNj(value);
    const hasError = exists && !inRange;
    const inRangeError = {
      ...errorState,
      hasError: hasError,
      label: Config.formation.fields.addressZipCode.error,
    };
    return combineErrorStates({ firstPriority: inRangeError, secondPriority: partialAddressError });
  }

  return (
    <FormationField fieldName="addressZipCode">
      <BusinessFormationTextField
        label={Config.formation.fields.addressZipCode.label}
        numericProps={{ maxLength: 5 }}
        errorBarType="NEVER"
        fieldName={"addressZipCode"}
        additionalValidationIsValid={(value: string | undefined): boolean => {
          return isValidWithAssociatedFields({
            value,
            formationFormData: state.formationFormData,
            associatedFields: ["addressLine1", "addressMunicipality"]
          })
        }}
        revalidateOnFields={[state.formationFormData.addressLine1, state.formationFormData.addressMunicipality]}
        validationText={Config.formation.general.partialAddressErrorText}
      />
    </FormationField>
  )
}