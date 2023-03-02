/* eslint-disable @typescript-eslint/no-explicit-any */

import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateNameAvailability } from "@/test/factories";
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

    it("uses errorInlineEmpty as label if name is missing", () => {
      const formData = generateFormationFormData({ businessName: "" });
      expect(getErrorStateForField("businessName", formData, undefined).label).toEqual(
        Config.formation.fields.businessName.errorInlineEmpty
      );
    });

    it("uses errorInlineNeedsToSearch as label if name exists but availability is undefined", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      expect(getErrorStateForField("businessName", formData, undefined).label).toEqual(
        Config.formation.fields.businessName.errorInlineNeedsToSearch
      );
    });

    it("uses errorInlineUnavailable as label if name availability is UNAVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "UNAVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.formation.fields.businessName.errorInlineUnavailable
      );
    });

    it("uses errorInlineUnavailable as label if name availability is error", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "DESIGNATOR" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.formation.fields.businessName.errorInlineUnavailable
      );
    });

    it("uses field name as label if name availability is AVAILABLE", () => {
      const formData = generateFormationFormData({ businessName: "some name" });
      const availability = generateNameAvailability({ status: "AVAILABLE" });
      expect(getErrorStateForField("businessName", formData, availability).label).toEqual(
        Config.formation.fields.businessName.fieldDisplayName
      );
    });
  });

  describe("foreignDateOfFormation", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: undefined });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).hasError).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).hasError).toEqual(true);
    });

    it("has no error in the past", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).hasError).toEqual(false);
    });

    it("has no error if today", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).hasError).toEqual(false);
    });

    it("has no error if in the future", () => {
      const formData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().add(1, "day").format(defaultDateFormat),
      });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).hasError).toEqual(false);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(getErrorStateForField("foreignDateOfFormation", formData, undefined).label).toEqual(
        Config.formation.fields.foreignDateOfFormation.error
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
        businessStartDate: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(true);
    });

    it("has no error if today", () => {
      const formData = generateFormationFormData({
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(false);
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
              expect(getErrorStateForField("businessStartDate", formData, undefined).hasError).toEqual(error);
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
      expect(getErrorStateForField("businessStartDate", formData, undefined).label).toEqual(
        Config.formation.fields.businessStartDate.fieldDisplayName
      );
    });
  });

  describe("addressZipCode", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ addressZipCode: "" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({ addressZipCode: "08100" });
      expect(getErrorStateForField("addressZipCode", formData, undefined).label).toEqual(
        Config.formation.fields.addressZipCode.fieldDisplayName
      );
    });

    describe("NJ", () => {
      it("has error if not in range", () => {
        const formData = generateFormationFormData({ addressZipCode: "12345", businessLocationType: "NJ" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
      });

      it("has no error if in range", () => {
        const formData = generateFormationFormData({ addressZipCode: "08100", businessLocationType: "NJ" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(false);
      });
    });

    describe("US", () => {
      it("has no error if outside of NJ range", () => {
        const formData = generateFormationFormData({ addressZipCode: "12345", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(false);
      });

      it("has error if less than 5 digits long", () => {
        const formData = generateFormationFormData({ addressZipCode: "0810", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
      });

      it("has error if more than 5 digits long", () => {
        const formData = generateFormationFormData({ addressZipCode: "1231245", businessLocationType: "US" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
      });
    });

    describe("INTL", () => {
      it("has no error if more than 5", () => {
        const formData = generateFormationFormData({
          addressZipCode: "1231245",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(false);
      });

      it("has no error if equal to or less than 11 digits in length", () => {
        const formData = generateFormationFormData({
          addressZipCode: "12345678912",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(false);
      });

      it("has error if greater than 11 digits in length", () => {
        const formData = generateFormationFormData({
          addressZipCode: "123456789124",
          businessLocationType: "INTL",
        });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
      });

      it("has error if zip code has no characters", () => {
        const formData = generateFormationFormData({ addressZipCode: "", businessLocationType: "INTL" });
        expect(getErrorStateForField("addressZipCode", formData, undefined).hasError).toEqual(true);
      });
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
        Config.formation.fields.agentOfficeAddressZipCode.fieldDisplayName
      );
    });
  });

  describe("agentEmail", () => {
    it("has error if empty", () => {
      const formData = generateFormationFormData({ agentEmail: "" });
      const errorState = getErrorStateForField("agentEmail", formData, undefined);
      expect(errorState.hasError).toEqual(true);
      expect(errorState.label).toEqual(Config.formation.fields.agentEmail.error);
    });

    it("has error if not valid email format", () => {
      const formData1 = generateFormationFormData({ agentEmail: "whatever@" });
      const errorState1 = getErrorStateForField("agentEmail", formData1, undefined);
      expect(errorState1.hasError).toEqual(true);
      expect(errorState1.label).toEqual(Config.formation.fields.agentEmail.error);

      const formData2 = generateFormationFormData({ agentEmail: "whatever@thing" });
      const errorState2 = getErrorStateForField("agentEmail", formData2, undefined);
      expect(errorState2.hasError).toEqual(true);
      expect(errorState2.label).toEqual(Config.formation.fields.agentEmail.error);

      const formData3 = generateFormationFormData({ agentEmail: "stuff" });
      const errorState3 = getErrorStateForField("agentEmail", formData3, undefined);
      expect(errorState3.hasError).toEqual(true);
      expect(errorState3.label).toEqual(Config.formation.fields.agentEmail.error);
    });

    it("has error if valid-format length is greater than 50 chars", () => {
      const longFormEntry = `${Array(43).fill("A").join("")}@aol.com`;
      const formData = generateFormationFormData({ agentEmail: longFormEntry });
      const errorState = getErrorStateForField("agentEmail", formData, undefined);
      expect(errorState.hasError).toEqual(true);
      expect(errorState.label).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentEmail.fieldDisplayName,
          maxLen: "50",
        })
      );
    });

    it("has no error if valid-format length is less than or equal to 50 chars", () => {
      const longFormEntry = `${Array(42).fill("A").join("")}@aol.com`;
      const formData = generateFormationFormData({ agentEmail: longFormEntry });
      const errorState = getErrorStateForField("agentEmail", formData, undefined);
      expect(errorState.hasError).toEqual(false);
    });
  });

  describe("agentOfficeAddressMunicipality", () => {
    it("has error if undefined", () => {
      const formData = generateFormationFormData({ agentOfficeAddressMunicipality: undefined });
      expect(getErrorStateForField("agentOfficeAddressMunicipality", formData, undefined).hasError).toEqual(
        true
      );
    });

    it("inserts label from config", () => {
      const formData = generateFormationFormData({
        agentOfficeAddressMunicipality: generateMunicipality({}),
      });
      expect(getErrorStateForField("agentOfficeAddressMunicipality", formData, undefined).label).toEqual(
        Config.formation.fields.agentOfficeAddressMunicipality.fieldDisplayName
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
            Config.formation.fields.signers.errorBannerSignerName
          );
        });

        it(`has NAME-labelled error when some ${field} name is just whitespace`, () => {
          const formData = generateFormationFormData({
            [field]: [generator({ name: " ", signature: true })],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerName
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
            Config.formation.fields.signers.errorBannerCheckbox
          );
        });

        it(`has TYPE-labelled error when some ${field} are not set`, () => {
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: "some-name", signature: true, title: "" }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerTitle
          );
        });

        it(`has MAX-LENGTH-labelled error when some ${field} names are too long`, () => {
          const tooLongName = Array(51).fill("A").join("");
          const formData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: tooLongName, signature: true }),
            ],
          });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            templateEval(Config.formation.general.maximumLengthErrorText, {
              field: Config.formation.fields.signers.fieldDisplayName,
              maxLen: "50",
            })
          );
        });

        it(`has MINIMUM-labelled error when length of ${field} is 0`, () => {
          const formData = generateFormationFormData({ [field]: [] });
          expect(getErrorStateForField(field, formData, undefined).hasError).toEqual(true);
          expect(getErrorStateForField(field, formData, undefined).label).toEqual(
            Config.formation.fields.signers.errorBannerMinimum
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
            Config.formation.fields.signers.errorBannerSignerName
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
                generateFormationIncorporator({
                  foreignAddressCity: "",
                  domesticAddressMunicipality: undefined,
                }),
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
        Config.formation.fields.directors.error
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
        members: [
          generateFormationMember({ foreignAddressCity: "", domesticAddressMunicipality: undefined }),
        ],
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

  describe("required fields with max length", () => {
    const fieldData: {
      field: FormationFields;
      maxLen: number;
      labelWhenMissing: string;
      labelWhenTooLong: string;
    }[] = [
      {
        field: "addressLine1",
        maxLen: 35,
        labelWhenMissing: Config.formation.fields.addressLine1.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine1.fieldDisplayName,
          maxLen: "35",
        }),
      },
      {
        field: "foreignAddressCity",
        maxLen: 30,
        labelWhenMissing: Config.formation.fields.foreignAddressCity.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.foreignAddressCity.fieldDisplayName,
          maxLen: "30",
        }),
      },
      {
        field: "agentName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.agentName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentName.fieldDisplayName,
          maxLen: "50",
        }),
      },
      {
        field: "contactFirstName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.contactFirstName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.contactFirstName.fieldDisplayName,
          maxLen: "50",
        }),
      },
      {
        field: "contactLastName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.contactLastName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.contactLastName.fieldDisplayName,
          maxLen: "50",
        }),
      },
      {
        field: "agentOfficeAddressLine1",
        maxLen: 35,
        labelWhenMissing: Config.formation.fields.agentOfficeAddressLine1.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentOfficeAddressLine1.fieldDisplayName,
          maxLen: "35",
        }),
      },
    ];

    for (const data of fieldData) {
      describe(`${data.field}`, () => {
        it("has error and label if empty", () => {
          const formData = generateFormationFormData({ [data.field]: "" });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenMissing);
        });

        it("has error and label if undefined", () => {
          const formData = generateFormationFormData({ [data.field]: undefined });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenMissing);
        });

        it(`has error if length is greater than ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen + 1)
            .fill("A")
            .join("");
          const formData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenTooLong);
        });

        it(`has no error if length is less than or equal to ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen).fill("A").join("");
          const formData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(false);
        });
      });
    }
  });

  describe("optional fields with max length", () => {
    const fieldData: {
      field: FormationFields;
      maxLen: number;
      labelWhenTooLong: string;
    }[] = [
      {
        field: "addressLine2",
        maxLen: 35,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine2.fieldDisplayName,
          maxLen: "35",
        }),
      },
      {
        field: "agentOfficeAddressLine2",
        maxLen: 35,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentOfficeAddressLine2.fieldDisplayName,
          maxLen: "35",
        }),
      },
    ];

    for (const data of fieldData) {
      describe(`${data.field}`, () => {
        it("has no error if empty", () => {
          const formData = generateFormationFormData({ [data.field]: "" });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(false);
        });

        it(`has error if length is greater than ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen + 1)
            .fill("A")
            .join("");
          const formData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenTooLong);
        });

        it(`has no error if length is less than or equal to ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen).fill("A").join("");
          const formData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField(data.field, formData, undefined);
          expect(errorState.hasError).toEqual(false);
        });
      });
    }
  });

  describe("fields that have error when undefined", () => {
    const hasErrorIfUndefined: FormationFields[] = [
      "canCreateLimitedPartner",
      "canGetDistribution",
      "canMakeDistribution",
      "addressCountry",
      "addressState",
      "domesticAddressMunicipality",
    ];

    const runTests = (hasErrorIfUndefined: FormationFields[], expectedLabel?: string) => {
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
            const formData = generateFormationFormData({ [field]: undefined });
            const label = expectedLabel ?? (Config.formation.fields as any)[field].fieldDisplayName;
            if (!label) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField(field, formData, undefined).label).toEqual(label);
          });
        });
      }
    };

    runTests(hasErrorIfUndefined);

    runTests(["foreignStateOfFormation"], Config.formation.fields.foreignStateOfFormation.error);
    runTests(["foreignStateOfFormation"], Config.formation.fields.foreignStateOfFormation.error);
  });

  describe("fields that have error when empty or false", () => {
    const hasErrorIfEmpty: FormationFields[] = [
      "businessSuffix",
      "contactPhoneNumber",
      "agentNumber",
      "agentOfficeAddressMunicipality",
      "businessTotalStock",
      "withdrawals",
      "combinedInvestment",
      "dissolution",
      "createLimitedPartnerTerms",
      "getDistributionTerms",
      "makeDistributionTerms",
      "paymentType",
      "addressProvince",
    ];

    const runTests = (hasErrorIfEmpty: FormationFields[]) => {
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
            const expectedLabel = (Config.formation.fields as any)[field].fieldDisplayName;
            if (!expectedLabel) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField(field, formData, undefined).label).toEqual(expectedLabel);
          });
        });
      }
    };

    runTests(hasErrorIfEmpty);
  });
});
