/* eslint-disable @typescript-eslint/no-explicit-any */

import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getMergedConfig } from "@/contexts/configContext";
import {
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationMember,
  generateFormationSigner,
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

  describe("addressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ addressZipCode: "" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has error if not in range", () => {
      const formData = generateFormationFormData({ addressZipCode: "12345" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("has no error if in range", () => {
      const formData = generateFormationFormData({ addressZipCode: "08100" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ addressZipCode: "08100" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressZipCode
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

  describe(`incorporator and signer fields`, () => {
    (["signers", "incorporators"] as ("signers" | "incorporators")[]).map((field) => {
      const generator = field == "signers" ? generateFormationSigner : generateFormationIncorporator;
      return describe(`${field}`, () => {
        it(`has NAME-labelled error when some ${field} do not have a name`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "", signature: true }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.businessFormationDefaults.signerNameErrorText
          );
        });

        it(`has NAME-labelled error when some ${field} name is just whitespace`, () => {
          const formData = generateFormationFormData({
            [field]: [generator({ name: " ", signature: true })],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.businessFormationDefaults.signerNameErrorText
          );
        });

        it(`has CHECKBOX-labelled error when some ${field} are not checked`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: false }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.businessFormationDefaults.signerCheckboxErrorText
          );
        });

        it(`has MINIMUM-labelled error when length of ${field} is 0`, () => {
          const formData = generateFormationFormData({ [field]: [] });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.businessFormationDefaults.signerMinimumErrorText
          );
        });

        it(`shows NAME error before CHECKBOX error if ${field} is missing both`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "", signature: true }),
              generator({ name: "some-name", signature: false }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.businessFormationDefaults.signerNameErrorText
          );
        });

        it(`has no error when all ${field} have name and checkbox`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(false);
        });

        if (field == "incorporators") {
          it(`has error if some incorporators missing city and municipality`, () => {
            const formData = generateFormationFormData({
              incorporators: [
                generateFormationIncorporator({ addressCity: "", addressMunicipality: undefined }),
              ],
            });
            expect(getErrorStateForField("incorporators", formData, undefined).hasError).toEqual(true);
          });

          it(`has error if some incorporators missing addressLine1`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressLine1: "" })],
            });
            expect(getErrorStateForField("incorporators", formData, undefined).hasError).toEqual(true);
          });

          it(`has error if some incorporators missing state`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressState: undefined })],
            });
            expect(getErrorStateForField("incorporators", formData, undefined).hasError).toEqual(true);
          });

          it(`has error if some incorporators missing zip code`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressZipCode: "" })],
            });
            expect(getErrorStateForField("incorporators", formData, undefined).hasError).toEqual(true);
          });
        }
      });
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
      const formData = generateFormationFormData({ members: [generateFormationMember({})] });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(false);
    });

    it("has error if some members missing name", () => {
      const formData = generateFormationFormData({ members: [generateFormationMember({ name: "" })] });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing city and municipality", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressCity: "", addressMunicipality: undefined })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing addressLine1", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressLine1: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing state", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressState: undefined })],
      });
      expect(getErrorStateForField("members", formData, undefined).hasError).toEqual(true);
    });

    it("has error if some members missing zip code", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressZipCode: "" })],
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
      "addressMunicipality",
      "addressLine1",
      "contactFirstName",
      "contactLastName",
      "contactPhoneNumber",
      "agentNumber",
      "agentName",
      "agentOfficeAddressLine1",
      "agentOfficeAddressMunicipality",
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
