import { getErrorStateForAddressField } from "@/components/profile/getErrorStateForAddressField";
import { getMergedConfig } from "@/contexts/configContext";
import {
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
} from "@/lib/utils/formation-helpers";
import { templateEval } from "@/lib/utils/helpers";
import { generateAddress } from "@/test/factories";

const Config = getMergedConfig();

describe("getErrorStateForAddressField", () => {
  describe("addressLine1", () => {
    it("has error max length exceeds max characters", () => {
      const address = generateAddress({
        addressLine1: "a".repeat(BUSINESS_ADDRESS_LINE_1_MAX_CHAR + 1),
      });

      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          addressData: address,
        }).label
      ).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine1.error,
          maxLen: String(BUSINESS_ADDRESS_LINE_1_MAX_CHAR),
        })
      );
    });

    it("does not have error if under max length of max characters", () => {
      const address = generateAddress({
        addressLine1: "a".repeat(BUSINESS_ADDRESS_LINE_1_MAX_CHAR),
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
    it("has error max length exceeds max characters", () => {
      const address = generateAddress({
        addressLine2: "a".repeat(BUSINESS_ADDRESS_LINE_2_MAX_CHAR + 1),
      });
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          addressData: address,
        }).hasError
      ).toEqual(true);
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          addressData: address,
        }).label
      ).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine2.error,
          maxLen: String(BUSINESS_ADDRESS_LINE_1_MAX_CHAR),
        })
      );
    });

    it("does not have error if under max length of max characters", () => {
      const address = generateAddress({
        addressLine2: "a".repeat(BUSINESS_ADDRESS_LINE_2_MAX_CHAR),
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
      const address = generateAddress({
        addressZipCode: "123",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressZipCode.error);
    });

    it("has error if not NJ zip code", () => {
      const address = generateAddress({
        addressZipCode: "12335",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressZipCode.error);
    });

    it("does not have error if valid NJ zip code", () => {
      const address = generateAddress({
        addressZipCode: "08123",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          addressData: address,
        }).hasError
      ).toEqual(false);
    });
  });

  describe("addressMunicipality", () => {
    it("has error if address municipality is undefined", () => {
      const address = generateAddress({
        addressLine1: "some addy",
        addressMunicipality: undefined,
        addressZipCode: "08123",
      });
      expect(
        getErrorStateForAddressField({
          field: "addressMunicipality",
          addressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressMunicipality",
          addressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressMunicipality.error);
    });
  });
});
