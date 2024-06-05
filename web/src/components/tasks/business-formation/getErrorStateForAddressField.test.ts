/* eslint-disable @typescript-eslint/no-explicit-any */
import { getErrorStateForAddressField } from "@/components/tasks/business-formation/getErrorStateForAddressField";
import { generateMunicipality } from "@businessnjgovnavigator/shared";

describe("getErrorStateForAddressField", () => {
  describe("addressLine1", () => {
    it("has error max length exceeds 35 characters", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "abcdefghijklmnopqrstuvwxyz12345678910",
        addressLine2: "",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "",
        addressCountry: undefined,
      };
      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if under max length of 35 characters", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "abcdefghijklmnopqrstuvwxyz",
        addressLine2: "",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "",
        addressCountry: undefined,
      };
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
      const address = {
        businessLocationType: "NJ",
        addressLine1: "324234",
        addressLine2: "abcdefghijklmnopqrstuvwxyz12345678910",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "",
        addressCountry: undefined,
      };
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if under max length of 35 characters", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "324234",
        addressLine2: "abcdefghijklmnopqrstuvwxyz",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "",
        addressCountry: undefined,
      };
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
      const address = {
        businessLocationType: "NJ",
        addressLine1: "324234",
        addressLine2: "abcdefghijklmnopqrstuvwxyz",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "123",
        addressCountry: undefined,
      };
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("has error if not NJ zip code", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "01234",
        addressCountry: undefined,
      };
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);
    });

    it("does not have error if valid NJ zip code", () => {
      const address = {
        businessLocationType: "NJ",
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressMunicipality: undefined,
        addressState: undefined,
        addressZipCode: "08123",
        addressCountry: undefined,
      };
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
      const address = {
        businessLocationType: "NJ",
        addressLine1: "abcdefghijklmnopqrstuvwxyz",
        addressLine2: "",
        addressCity: "",
        addressState: undefined,
        addressMunicipality: undefined,
        addressZipCode: "",
        addressCountry: undefined,
      };
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
      const address = {
        businessLocationType: "NJ",
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressState: undefined,
        addressMunicipality: generateMunicipality({}),
        addressZipCode: "",
        addressCountry: undefined,
      };
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
      const address = {
        businessLocationType: "NJ",
        addressLine1: "",
        addressLine2: "",
        addressCity: "",
        addressState: undefined,
        addressMunicipality: undefined,
        addressZipCode: "08212",
        addressCountry: undefined,
      };
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
