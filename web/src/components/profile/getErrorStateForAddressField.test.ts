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
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressLine1",
          formationAddressData: address,
        }).label
      ).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine1.label,
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
          formationAddressData: address,
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
          formationAddressData: address,
        }).hasError
      ).toEqual(true);
      expect(
        getErrorStateForAddressField({
          field: "addressLine2",
          formationAddressData: address,
        }).label
      ).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine2.label,
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
          formationAddressData: address,
        }).hasError
      ).toEqual(false);
    });
  });

  describe("addressZipCode", () => {
    it("has error if NJ zip code is less than 5 digits", () => {
      const address = generateAddress({
        addressZipCode: "123",
        addressState: {
          name: "New Jersey",
          shortCode: "NJ",
        },
      });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressZipCode.error);
    });

    it("has error if not NJ zip code", () => {
      const address = generateAddress({
        addressZipCode: "12335",
        addressState: {
          name: "New Jersey",
          shortCode: "NJ",
        },
      });
      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressZipCode",
          formationAddressData: address,
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
          formationAddressData: address,
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
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressMunicipality",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressMunicipality.error);
    });
  });

  describe("addressCity", () => {
    it("has error if address city is undefined", () => {
      const address = generateAddress({
        addressLine1: "123 Main Street",
        addressCity: undefined,
        addressZipCode: "10001",
      });

      expect(
        getErrorStateForAddressField({
          field: "addressCity",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressCity",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressCity.error);
    });
  });

  describe("addressProvince", () => {
    it("has error if address city is undefined", () => {
      const address = generateAddress({
        addressLine1: "1 London Way",
        addressProvince: undefined,
      });

      expect(
        getErrorStateForAddressField({
          field: "addressProvince",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressProvince",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressProvince.error);
    });
  });

  describe("addressCountry", () => {
    it("has error if addressCountry is undefined", () => {
      const address = generateAddress({
        addressLine1: "1 London Way",
        addressCountry: undefined,
      });

      expect(
        getErrorStateForAddressField({
          field: "addressCountry",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressCountry",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressCountry.error);
    });
  });

  describe("addressState", () => {
    it("has error if addressState is undefined", () => {
      const address = generateAddress({
        addressLine1: "123 Main Street",
        addressState: undefined,
      });

      expect(
        getErrorStateForAddressField({
          field: "addressState",
          formationAddressData: address,
        }).hasError
      ).toEqual(true);

      expect(
        getErrorStateForAddressField({
          field: "addressState",
          formationAddressData: address,
        }).label
      ).toEqual(Config.formation.fields.addressState.error);
    });
  });
});
