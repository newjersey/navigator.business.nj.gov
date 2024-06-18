import { arrayOfCountriesObjects, foreignCorpLegalStructures } from "@businessnjgovnavigator/shared";
import { FormationFormData } from "@businessnjgovnavigator/shared/";

export const getAddressCity = (formationFormData: FormationFormData): string | undefined => {
  return formationFormData.businessLocationType === "NJ"
    ? formationFormData.addressMunicipality?.displayName
    : formationFormData.addressCity;
};

export const getAddressState = (formationFormData: FormationFormData): string | undefined => {
  return formationFormData.businessLocationType === "INTL"
    ? formationFormData.addressProvince
    : formationFormData.addressState?.name;
};

export const getAddressCountry = (formationFormData: FormationFormData): string | undefined => {
  return formationFormData.businessLocationType === "INTL"
    ? arrayOfCountriesObjects.find((country) => country.shortCode === formationFormData.addressCountry)?.name
    : undefined;
};

export const shouldDisplayAddressSection = (formationFormData: FormationFormData): boolean => {
  return (
    foreignCorpLegalStructures.includes(formationFormData.legalType) ||
    !!formationFormData.addressLine1 ||
    !!formationFormData.addressLine2 ||
    !!getAddressCity(formationFormData) ||
    !!formationFormData.addressZipCode ||
    !!getAddressCountry(formationFormData)
  );
};
export const BUSINESS_ADDRESS_LINE_1_MAX_CHAR = 35;
export const BUSINESS_ADDRESS_LINE_2_MAX_CHAR = 35;
