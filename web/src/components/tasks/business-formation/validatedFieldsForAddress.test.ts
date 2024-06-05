import { validatedFieldsForAddress } from "@/components/tasks/business-formation/validatedFieldsForAddress";
import { Address, AddressFields, FieldsForAddressErrorHandling } from "@businessnjgovnavigator/shared";

describe("validatedFieldsForAddress", () => {
  const validatedFields: FieldsForAddressErrorHandling[] = [
    "addressLine1",
    "addressMunicipality",
    "addressState",
    "addressZipCode",
  ];

  const foreignValidatedFields: AddressFields[] = ["addressCity"];

  describe("addressFields", () => {
    it("required validated fields for NJ", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "addressLine1",
        addressLine2: "addressLine2",
        addressZipCode: "08261",
        addressCountry: "US",
      } as Address;
      const expected: FieldsForAddressErrorHandling[] = [...validatedFields];
      expected.push("addressMunicipality");
      expect(validatedFieldsForAddress(address)).toEqual(expect.arrayContaining(expected));
    });

    it("required validated field for INTL", () => {
      const address = {
        businessLocationType: "INTL",
        addressLine1: "addressLine1",
        addressLine2: "addressLine2",
        addressZipCode: "08261",
        addressCountry: "US",
      } as Address;
      const expected: FieldsForAddressErrorHandling[] = [
        ...validatedFields,
        ...foreignValidatedFields,
        "addressProvince",
        "addressCountry",
      ];
      expect(validatedFieldsForAddress(address)).toEqual(expect.arrayContaining(expected));
    });

    it("required validated field for US", () => {
      const address = {
        businessLocationType: "US",
        addressLine1: "addressLine1",
        addressLine2: "addressLine2",
        addressZipCode: "08261",
        addressCountry: "US",
      } as Address;
      const expected: FieldsForAddressErrorHandling[] = [...validatedFields, ...foreignValidatedFields];
      expect(validatedFieldsForAddress(address)).toEqual(expect.arrayContaining(expected));
    });
  });
});
