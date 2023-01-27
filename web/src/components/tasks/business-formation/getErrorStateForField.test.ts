/* eslint-disable @typescript-eslint/no-explicit-any */

import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getMergedConfig } from "@/contexts/configContext";
import { generateFormationDisplayContentMap, generateNameAvailability } from "@/test/factories";
import {
  defaultDateFormat,
  FormationFields,
  FormationLegalType,
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationMember,
  generateFormationSigner,
  generateMunicipality,
  getCurrentDate,
  getCurrentDateFormatted,
} from "@businessnjgovnavigator/shared";

const Config = getMergedConfig();

describe("getErrorStateForField", () => {
  const displayContent = generateFormationDisplayContentMap({})["limited-liability-company"];

  describe("businessName", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ businessName: "" });
      expect(getErrorStateForField("businessName", formData, undefined, displayContent).hasError).toEqual(
        true
      );
    });

    it("has error if no name availability data", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      expect(getErrorStateForField("businessName", formData, undefined, displayContent).hasError).toEqual(
        true
      );
    });

    it("has error if unavailable", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "UNAVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).hasError).toEqual(
        true
      );
    });

    it("has error if availablity error", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "DESIGNATOR" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).hasError).toEqual(
        true
      );
    });

    it("has no error if available", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "AVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).hasError).toEqual(
        false
      );
    });

    it("uses emptyFieldError as label if name is missing", () => {
      const formData = generateFormationFormData({ businessName: "" });
      expect(getErrorStateForField("businessName", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.nameCheckEmptyFieldErrorText
      );
    });

    it("uses needsToSearchError as label if name exists but availability is undefined", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      expect(getErrorStateForField("businessName", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.nameCheckNeedsToSearchErrorText
      );
    });

    it("uses UnavailableInlineError as label if name availability is UNAVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "UNAVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).label).toEqual(
        Config.businessFormationDefaults.nameCheckUnavailableInlineErrorText
      );
    });

    it("uses UnavailableInlineError as label if name availability is error", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "DESIGNATOR" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).label).toEqual(
        Config.businessFormationDefaults.nameCheckUnavailableInlineErrorText
      );
    });

    it("uses field name as label if name availability is AVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "AVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability, displayContent).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessName
      );
    });
  });

  describe("foreignDateOfFormation", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: undefined });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has no error in the past", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).hasError
      ).toEqual(false);
    });

    it("has no error if today", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).hasError
      ).toEqual(false);
    });

    it("has no error if in the future", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().add(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).hasError
      ).toEqual(false);
    });

    it("inserts label from displayContent", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(
        getErrorStateForField("foreignDateOfFormation", formData, undefined, displayContent).label
      ).toEqual(displayContent.foreignDateOfFormationHeader.requireFieldText);
    });
  });

  describe("businessStartDate", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ businessStartDate: "" });
      expect(
        getErrorStateForField("businessStartDate", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formData = generateFormationFormData({ businessStartDate: "1234567" });
      expect(
        getErrorStateForField("businessStartDate", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has error in the past", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField("businessStartDate", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has no error if today", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(
        getErrorStateForField("businessStartDate", formData, undefined, displayContent).hasError
      ).toEqual(false);
    });

    describe("future date validation", () => {
      const testFutureDates = (
        legalStructureIds: FormationLegalType[],
        additionalDays: number,
        error: boolean
      ) =>
        legalStructureIds.map((legalStructureId) =>
          describe(`for ${legalStructureId}`, () => {
            it(`has${error ? " " : " no "}error if in the future`, () => {
              const formData = generateFormationFormData(
                {
                  businessStartDate: getCurrentDate().add(additionalDays, "day").format(defaultDateFormat),
                },
                { legalStructureId }
              );
              expect(
                getErrorStateForField("businessStartDate", formData, undefined, displayContent).hasError
              ).toEqual(error);
            });
          })
        );

      describe("any future date", () => {
        const legalStructureIds: FormationLegalType[] = [
          "limited-liability-company",
          "limited-liability-partnership",
          "foreign-limited-liability-partnership",
        ];
        testFutureDates(legalStructureIds, 123, false);
      });

      describe("only current date", () => {
        const legalStructureIds: FormationLegalType[] = [
          "foreign-limited-partnership",
          "foreign-limited-liability-company",
        ];
        testFutureDates(legalStructureIds, 1, true);
      });

      describe("upto 30 days in the future", () => {
        const legalStructureIds: FormationLegalType[] = ["limited-partnership"];
        testFutureDates(legalStructureIds, 29, false);
        testFutureDates(legalStructureIds, 31, true);
      });

      describe("upto 90 days in the future", () => {
        const legalStructureIds: FormationLegalType[] = ["c-corporation", "s-corporation"];
        testFutureDates(legalStructureIds, 75, false);
        testFutureDates(legalStructureIds, 91, true);
      });
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDate().add(1, "day").format(defaultDateFormat),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessStartDate
      );
    });
  });

  describe("addressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ addressZipCode: "" });
      expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
        true
      );
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ addressZipCode: "08100" });
      expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressZipCode
      );
    });

    describe("NJ", () => {
      it("has error if not in range", () => {
        const formData = generateFormationFormData({ addressZipCode: "12345", businessLocationType: "NJ" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          true
        );
      });

      it("has no error if in range", () => {
        const formData = generateFormationFormData({ addressZipCode: "08100", businessLocationType: "NJ" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          false
        );
      });
    });

    describe("US", () => {
      it("has no error if outside of NJ range", () => {
        const formData = generateFormationFormData({ addressZipCode: "12345", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          false
        );
      });

      it("has error if less than 5 digits long", () => {
        const formData = generateFormationFormData({ addressZipCode: "0810", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          true
        );
      });

      it("has error if more than 5 digits long", () => {
        const formData = generateFormationFormData({ addressZipCode: "1231245", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          true
        );
      });
    });

    describe("INTL", () => {
      it("has no error if more than 5", () => {
        const formData = generateFormationFormData({
          addressZipCode: "1231245",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          false
        );
      });

      it("has no error if equal to or less than 11 digits in length", () => {
        const formData = generateFormationFormData({
          addressZipCode: "12345678912",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          false
        );
      });

      it("has error if greater than 11 digits in length", () => {
        const formData = generateFormationFormData({
          addressZipCode: "123456789124",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          true
        );
      });

      it("has error if less than 5 digits in length", () => {
        const formData = generateFormationFormData({ addressZipCode: "1234", businessLocationType: "INTL" });
        expect(getErrorStateForField("addressZipCode", formData, undefined, displayContent).hasError).toEqual(
          true
        );
      });
    });
  });

  describe("agentOfficeAddressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "" });
      expect(
        getErrorStateForField("agentOfficeAddressZipCode", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has error if not in range", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "12345" });
      expect(
        getErrorStateForField("agentOfficeAddressZipCode", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("has no error if in range", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(
        getErrorStateForField("agentOfficeAddressZipCode", formData, undefined, displayContent).hasError
      ).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(
        getErrorStateForField("agentOfficeAddressZipCode", formData, undefined, displayContent).label
      ).toEqual(Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressZipCode);
    });
  });

  describe("agentEmail", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ agentEmail: "" });
      expect(getErrorStateForField("agentEmail", formData, undefined, displayContent).hasError).toEqual(true);
    });

    it("has error if not valid email format", () => {
      const formData1 = generateFormationFormData({ agentEmail: "whatever@" });
      expect(getErrorStateForField("agentEmail", formData1, undefined, displayContent).hasError).toEqual(
        true
      );

      const formData2 = generateFormationFormData({ agentEmail: "whatever@thing" });
      expect(getErrorStateForField("agentEmail", formData2, undefined, displayContent).hasError).toEqual(
        true
      );

      const formData3 = generateFormationFormData({ agentEmail: "stuff" });
      expect(getErrorStateForField("agentEmail", formData3, undefined, displayContent).hasError).toEqual(
        true
      );
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ agentEmail: "example@test.com" });
      expect(getErrorStateForField("agentEmail", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentEmail
      );
    });
  });

  describe("agentOfficeAddressMunicipality", () => {
    it("has error if undefined", () => {
      const formData = generateFormationFormData({ agentOfficeAddressMunicipality: undefined });
      expect(
        getErrorStateForField("agentOfficeAddressMunicipality", formData, undefined, displayContent).hasError
      ).toEqual(true);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({
        agentOfficeAddressMunicipality: generateMunicipality({}),
      });
      expect(
        getErrorStateForField("agentOfficeAddressMunicipality", formData, undefined, displayContent).label
      ).toEqual(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.agentOfficeAddressMunicipality
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
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
            Config.businessFormationDefaults.signerNameErrorText
          );
        });

        it(`has NAME-labelled error when some ${field} name is just whitespace`, () => {
          const formData = generateFormationFormData({
            [field]: [generator({ name: " ", signature: true })],
          });
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
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
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
            Config.businessFormationDefaults.signerCheckboxErrorText
          );
        });

        it(`has TYPE-labelled error when some ${field} are not set`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: "some-name", signature: true, title: "" }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
            Config.businessFormationDefaults.signerTypeErrorText
          );
        });

        it(`has MINIMUM-labelled error when length of ${field} is 0`, () => {
          const formData = generateFormationFormData({ [field]: [] });
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
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
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
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
          expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(false);
        });

        if (field == "incorporators") {
          it(`has error if some incorporators missing city and municipality`, () => {
            const formData = generateFormationFormData({
              incorporators: [
                generateFormationIncorporator({ addressCity: "", addressMunicipality: undefined }),
              ],
            });
            expect(
              getErrorStateForField("incorporators", formData, undefined, displayContent).hasError
            ).toEqual(true);
          });

          it(`has error if some incorporators missing addressLine1`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressLine1: "" })],
            });
            expect(
              getErrorStateForField("incorporators", formData, undefined, displayContent).hasError
            ).toEqual(true);
          });

          it(`has error if some incorporators missing state`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressState: undefined })],
            });
            expect(
              getErrorStateForField("incorporators", formData, undefined, displayContent).hasError
            ).toEqual(true);
          });

          it(`has error if some incorporators missing zip code`, () => {
            const formData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressZipCode: "" })],
            });
            expect(
              getErrorStateForField("incorporators", formData, undefined, displayContent).hasError
            ).toEqual(true);
          });
        }
      });
    });
  });

  describe("members", () => {
    it("has MINIMUM-labelled error when members length is 0", () => {
      const formData = generateFormationFormData({ members: [] });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
      expect(getErrorStateForField("members", formData, undefined, displayContent).label).toEqual(
        Config.businessFormationDefaults.directorsMinimumErrorText
      );
    });

    it("has no error when members exist", () => {
      const formData = generateFormationFormData({ members: [generateFormationMember({})] });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(false);
    });

    it("has error if some members missing name", () => {
      const formData = generateFormationFormData({ members: [generateFormationMember({ name: "" })] });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
    });

    it("has error if some members missing city and municipality", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressCity: "", addressMunicipality: undefined })],
      });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
    });

    it("has error if some members missing addressLine1", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressLine1: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
    });

    it("has error if some members missing state", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressState: undefined })],
      });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
    });

    it("has error if some members missing zip code", () => {
      const formData = generateFormationFormData({
        members: [generateFormationMember({ addressZipCode: "" })],
      });
      expect(getErrorStateForField("members", formData, undefined, displayContent).hasError).toEqual(true);
    });
  });

  describe("fields that have error when undefined", () => {
    const hasErrorIfUndefined: FormationFields[] = [
      "canCreateLimitedPartner",
      "canGetDistribution",
      "canMakeDistribution",
      "addressMunicipality",
      "addressCountry",
      "addressState",
    ];

    const runTests = (hasErrorIfUndefined: FormationFields[], expectedLabel?: string) => {
      for (const field of hasErrorIfUndefined) {
        describe(`${field}`, () => {
          it("has error if undefined", () => {
            const formData = generateFormationFormData({ [field]: undefined });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          });

          it("has no error if false", () => {
            const formData = generateFormationFormData({ [field]: false });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(false);
          });

          it("has no error if value", () => {
            const formData = generateFormationFormData({ [field]: "some-value" });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(false);
          });

          it("inserts label from config", () => {
            const formData = generateFormationFormData({ [field]: undefined });
            const label =
              expectedLabel ??
              (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[field];
            if (!label) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(label);
          });
        });
      }
    };

    runTests(hasErrorIfUndefined);

    runTests(["foreignStateOfFormation"], displayContent.foreignStateOfFormationHeader.requireFieldText);
    runTests(["foreignStateOfFormation"], displayContent.foreignStateOfFormationHeader.requireFieldText);
  });

  describe("fields that have error when empty or false", () => {
    const hasErrorIfEmpty: FormationFields[] = [
      "businessSuffix",
      "addressLine1",
      "contactFirstName",
      "contactLastName",
      "contactPhoneNumber",
      "agentNumber",
      "agentName",
      "agentOfficeAddressLine1",
      "businessTotalStock",
      "withdrawals",
      "combinedInvestment",
      "dissolution",
      "createLimitedPartnerTerms",
      "getDistributionTerms",
      "makeDistributionTerms",
      "paymentType",
      "addressProvince",
      "addressCity",
    ];

    const runTests = (hasErrorIfEmpty: FormationFields[]) => {
      for (const field of hasErrorIfEmpty) {
        describe(`${field}`, () => {
          it("has error if empty", () => {
            const formData = generateFormationFormData({ [field]: "" });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          });

          it("has error if undefined", () => {
            const formData = generateFormationFormData({ [field]: undefined });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(true);
          });

          it("has no error if value", () => {
            const formData = generateFormationFormData({ [field]: "some-value" });
            expect(getErrorStateForField(field, formData, undefined, displayContent).hasError).toEqual(false);
          });

          it("inserts label from config", () => {
            const formData = generateFormationFormData({ [field]: "some-value" });
            const expectedLabel = (Config.businessFormationDefaults.requiredFieldsBulletPointLabel as any)[
              field
            ];
            if (!expectedLabel) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField(field, formData, undefined, displayContent).label).toEqual(
              expectedLabel
            );
          });
        });
      }
    };

    runTests(hasErrorIfEmpty);
  });
});
