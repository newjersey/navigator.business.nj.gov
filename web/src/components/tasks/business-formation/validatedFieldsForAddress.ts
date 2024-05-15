import { Address, AddressFields, FieldsForAddressErrorHandling } from "@businessnjgovnavigator/shared/userData";

export const validatedFieldsForAddress = (addressData: Address): FieldsForAddressErrorHandling[] => {
  let validatedFields: FieldsForAddressErrorHandling[] = [
    "addressLine1",
    "addressLine2",
   "addressZipCode",

  ];

  const foreignValidatedFields: AddressFields[] = [
    "addressCity"
  ];

  switch (addressData.businessLocationType) {
    case "US":
      validatedFields = [...validatedFields, ...foreignValidatedFields, "addressState"];
      break;
    case "INTL":
      validatedFields = [...validatedFields, ...foreignValidatedFields, "addressProvince", "addressCountry"];
      break;
    case "NJ":
      validatedFields.push("addressMunicipality");
  }

  return validatedFields;
};
