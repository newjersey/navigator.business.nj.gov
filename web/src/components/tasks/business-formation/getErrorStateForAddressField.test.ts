/* eslint-disable @typescript-eslint/no-explicit-any */
import { getErrorStateForAddressField } from "@/components/tasks/business-formation/getErrorStateForAddressField";
import { generateAddress, generateMunicipality } from "@businessnjgovnavigator/shared";

describe("getErrorStateForAddressField", () => {
  describe("addressLine1", () => {
    it("has error max length exceeds 35 characters", () => {
      const address = generateAddress({
        addressLine1: "abcdefghijklmnopqrstuvwxyz12345678910",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if under max length of 35 characters", () => {
      const address = generateAddress({
        addressLine1: "abcdefghijklmnopqrstuvwxyz",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(false);
    });
  });

  describe("addressLine2", () => {
    it("has error max length exceeds 35 characters", () => {
      const address = generateAddress({
        addressLine2: "abcdefghijklmnopqrstuvwxyz12345678910",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if under max length of 35 characters", () => {
      const address = generateAddress({
        addressLine2: "abcdefghijklmnopqrstuvwxyz",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          addressData: address,
        }).hasError
      ).toEqual(false);
    });
  });

  describe("addressZipCode", () => {
    it("has error if less than 5 digits", () => {
      const address = generateAddress({ addressZipCode: "123", businessLocationType: "NJ" });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("has error if not NJ zip code", () => {
      const address = generateAddress({ addressZipCode: "01234", businessLocationType: "NJ" });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if valid NJ zip code", () => {
      const address = generateAddress({ addressZipCode: "08123", businessLocationType: "NJ" });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(false);
    });
  });

  describe("addressLine1, addressZipCode, addressMunicipality", () => {
    it("has error if addressLine1 is filled out and no address municipality and no address zip code", () => {
      const address = generateAddress({
        addressLine1: "abcdefghijklmnopqrstuvwxyz",
        addressMunicipality: undefined,
        addressZipCode: "",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressMunicipality",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("has error if address municipality is filled out and no address line 1 and no address zip code", () => {
      const address = generateAddress({
        addressLine1: "",
        addressMunicipality: generateMunicipality({}),
        addressZipCode: "",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("has error if address zip code is filled out and no address line 1 and no address municipality", () => {
      const address = generateAddress({
        addressLine1: "",
        addressMunicipality: undefined,
        addressZipCode: "08212",
        businessLocationType: "NJ",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressMunicipality",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });
  });
});
