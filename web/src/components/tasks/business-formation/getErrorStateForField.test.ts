/* eslint-disable @typescript-eslint/no-explicit-any */

import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getMergedConfig } from "@/contexts/configContext";
import {
  generateFormationAddress,
  generateFormationFormData,
  generateNameAvailability,
} from "@/test/factories";
import { getCurrentDate, getCurrentDateFormatted } from "@businessnjgovnavigator/shared/dateHelpers";
import { FormationFields } from "@businessnjgovnavigator/shared/formationData";

const Config = getMergedConfig();

describe("getErrorStateForField", () => {
  describe("businessName", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ businessName: "" });
      expect(getErrorStateForField("businessName", formData, undefined).hasError).toEqual(true);
    });

    it("has error if no name availability data", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      expect(getErrorStateForField("businessName", formData, undefined).hasError).toEqual(true);
    });

    it("has error if unavailable", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "UNAVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).hasError).toEqual(true);
    });

    it("has error if availablity error", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "DESIGNATOR" });
      expect(getErrorStateForField("businessName", formData, availability).hasError).toEqual(true);
    });

    it("has no error if available", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "AVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).hasError).toEqual(false);
    });

    it("uses emptyFieldError as label if name is missing", () => {
      const formData = generateFormationFormData({ businessName: "" });
      expect(getErrorStateForField("businessName", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.nameCheckEmptyFieldErrorText
      );
    });

    it("uses needsToSearchError as label if name exists but availability is undefined", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      expect(getErrorStateForField("businessName", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.nameCheckNeedsToSearchErrorText
      );
    });

    it("uses UnavailableInlineError as label if name availability is UNAVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "UNAVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.businessFormationDefaults.nameCheckUnavailableInlineErrorText
      );
    });

    it("uses UnavailableInlineError as label if name availability is error", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "DESIGNATOR" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.businessFormationDefaults.nameCheckUnavailableInlineErrorText
      );
    });

    it("uses field name as label if name availability is AVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "AVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessName
      );
    });
  });

  describe("businessStartDate", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ businessStartDate: "" });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formData = generateFormationFormData({ businessStartDate: "1234567" });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(true);
    });

    it("has error in the past", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDate().subtract(1, "day").format("YYYY-MM-DD"),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(true);
    });

    it("has no error if today", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDateFormatted("YYYY-MM-DD"),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(false);
    });

    it("has no error if in the future", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessStartDate
      );
    });
  });

  describe("businessAddressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ businessAddressZipCode: "" });
      expect(getErrorStateForField("businessAddressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has error if not in range", () => {
      const formData = generateFormationFormData({ businessAddressZipCode: "12345" });
      expect(getErrorStateForField("businessAddressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has no error if in range", () => {
      const formData = generateFormationFormData({ businessAddressZipCode: "08100" });
      expect(getErrorStateForField("businessAddressZipCode", formData, undefined).hasError).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ businessAddressZipCode: "08100" });
      expect(getErrorStateForField("businessAddressZipCode", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessAddressZipCode
      );
    });
  });

  describe("agentOfficeAddressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "" });
      expect(getErrorStateForField("agentOfficeAddressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has error if not in range", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "12345" });
      expect(getErrorStateForField("agentOfficeAddressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has no error if in range", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(getErrorStateForField("agentOfficeAddressZipCode", formData, undefined).hasError).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(getErrorStateForField("agentOfficeAddressZipCode", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressZipCode
      );
    });
  });

  describe("agentEmail", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ agentEmail: "" });
      expect(getErrorStateForField("agentEmail", formData, undefined).hasError).toEqual(true);
    });

    it("has error if not valid email format", () => {
      const formData1 = generateFormationFormData({ agentEmail: "whatever@" });
      expect(getErrorStateForField("agentEmail", formData1, undefined).hasError).toEqual(true);

      const formData2 = generateFormationFormData({ agentEmail: "whatever@thing" });
      expect(getErrorStateForField("agentEmail", formData2, undefined).hasError).toEqual(true);

      const formData3 = generateFormationFormData({ agentEmail: "stuff" });
      expect(getErrorStateForField("agentEmail", formData3, undefined).hasError).toEqual(true);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ agentEmail: "example@test.com" });
      expect(getErrorStateForField("agentEmail", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentEmail
      );
    });
  });

  describe("signers", () => {
    it("has NAME-labelled error when some signers do not have a name", () => {
      const formData = generateFormationFormData({
        signers: [
          generateFormationAddress({ name: "", signature: true }),
          generateFormationAddress({ name: "some-name", signature: true }),
        ],
      });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("signers", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.signerNameErrorText
      );
    });

    it("has NAME-labelled error when some signers name is just whitespace", () => {
      const formData = generateFormationFormData({
        signers: [generateFormationAddress({ name: " ", signature: true })],
      });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("signers", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.signerNameErrorText
      );
    });

    it("has CHECKBOX-labelled error when some signers are not checked", () => {
      const formData = generateFormationFormData({
        signers: [
          generateFormationAddress({ name: "some-name", signature: false }),
          generateFormationAddress({ name: "some-name", signature: true }),
        ],
      });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("signers", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.signerCheckboxErrorText
      );
    });

    it("has MINIMUM-labelled error when length of signers is 0", () => {
      const formData = generateFormationFormData({ signers: [] });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("signers", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.signerMinimumErrorText
      );
    });

    it("shows NAME error before CHECKBOX error if signer is missing both", () => {
      const formData = generateFormationFormData({
        signers: [
          generateFormationAddress({ name: "", signature: true }),
          generateFormationAddress({ name: "some-name", signature: false }),
        ],
      });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("signers", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.signerNameErrorText
      );
    });

    it("has no error when all signers have name and checkbox", () => {
      const formData = generateFormationFormData({
        signers: [
          generateFormationAddress({ name: "some-name", signature: true }),
          generateFormationAddress({ name: "some-name", signature: true }),
        ],
      });
      expect(getErrorStateForField("signers", formData, undefined).hasError).toEqual(false);
    });
  });

  describe("members", () => {
    it("has MINIMUM-labelled error when members length is 0", () => {
      const formData = generateFormationFormData({ members: [] });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
      expect(getErrorStateForField("members", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.directorsMinimumErrorText
      );
    });

    it("has no error when members exist", () => {
      const formData = generateFormationFormData({ members: [generateFormationAddress({})] });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(false);
    });

    it("has error if some members missing name", () => {
      const formData = generateFormationFormData({ members: [generateFormationAddress({ name: "" })] });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing city", () => {
      const formData = generateFormationFormData({
        members: [generateFormationAddress({ addressCity: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing addressLine1", () => {
      const formData = generateFormationFormData({
        members: [generateFormationAddress({ addressLine1: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing state", () => {
      const formData = generateFormationFormData({
        members: [generateFormationAddress({ addressState: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing zip code", () => {
      const formData = generateFormationFormData({
        members: [generateFormationAddress({ addressZipCode: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });
  });

  describe("fields that have error when undefined", () => {
    const hasErrorIfUndefined: FormationFields[] = [
      "canCreateLimitedPartner",
      "canGetDistribution",
      "canMakeDistribution",
    ];

    for (const field of hasErrorIfUndefined) {
      describe(`${field}`, () => {
        it("has error if undefined", () => {
          const formData = generateFormationFormData({ [field]: undefined });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
        });

        it("has no error if false", () => {
          const formData = generateFormationFormData({ [field]: false });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(false);
        });

        it("has no error if value", () => {
          const formData = generateFormationFormData({ [field]: "some-value" });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(false);
        });

        it("inserts label from config", () => {
          const formData = generateFormationFormData({ [field]: "some-value" });
          const expectedLabel = (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[
            field
          ];
          if (!expectedLabel) {
            throw `label missing in config for ${field}`;
          }
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(expectedLabel);
        });
      });
    }
  });

  describe("fields that have error when empty or false", () => {
    const hasErrorIfEmpty: FormationFields[] = [
      "businessSuffix",
      "businessAddressCity",
      "businessAddressLine1",
      "contactFirstName",
      "contactLastName",
      "contactPhoneNumber",
      "agentNumber",
      "agentName",
      "agentOfficeAddressLine1",
      "agentOfficeAddressCity",
      "businessTotalStock",
      "withdrawals",
      "combinedInvestment",
      "dissolution",
      "createLimitedPartnerTerms",
      "getDistributionTerms",
      "makeDistributionTerms",
      "paymentType",
    ];

    for (const field of hasErrorIfEmpty) {
      describe(`${field}`, () => {
        it("has error if empty", () => {
          const formData = generateFormationFormData({ [field]: "" });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
        });

        it("has error if undefined", () => {
          const formData = generateFormationFormData({ [field]: undefined });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
        });

        it("has no error if value", () => {
          const formData = generateFormationFormData({ [field]: "some-value" });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(false);
        });

        it("inserts label from config", () => {
          const formData = generateFormationFormData({ [field]: "some-value" });
          const expectedLabel = (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[
            field
          ];
          if (!expectedLabel) {
            throw `label missing in config for ${field}`;
          }
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(expectedLabel);
        });
      });
    }
  });
});
