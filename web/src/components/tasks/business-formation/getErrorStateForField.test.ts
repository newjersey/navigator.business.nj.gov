/* eslint-disable @typescript-eslint/no-explicit-any */

import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateInputFile } from "@/test/factories";
import {
  defaultDateFormat,
  FormationFields,
  FormationLegalType,
  generateBusinessNameAvailability,
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
      const formationFormData = generateFormationFormData({ businessName: "" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has error if no name availability data", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has error if unavailable", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "UNAVAILABLE" });
      expect(
        getErrorStateForField({ field: "businessName", formationFormData, businessNameAvailability }).hasError
      ).toEqual(true);
    });

    it("has error if availability error", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "DESIGNATOR_ERROR" });
      expect(
        getErrorStateForField({ field: "businessName", formationFormData, businessNameAvailability }).hasError
      ).toEqual(true);
    });

    it("has no error if available", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "AVAILABLE" });
      expect(
        getErrorStateForField({ field: "businessName", formationFormData, businessNameAvailability }).hasError
      ).toEqual(false);
    });

    it("uses errorInlineEmpty as label if name is missing", () => {
      const formationFormData = generateFormationFormData({ businessName: "" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
        }).label
      ).toEqual(Config.formation.fields.businessName.errorInlineEmpty);
    });

    it("uses errorInlineNeedsToSearch as label if name exists but availability is undefined", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
        }).label
      ).toEqual(Config.formation.fields.businessName.errorInlineNeedsToSearch);
    });

    it("uses errorInlineUnavailable as label if name availability is UNAVAILABLE", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "UNAVAILABLE" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
          businessNameAvailability,
        }).label
      ).toEqual(Config.formation.fields.businessName.errorInlineUnavailable);
    });

    it("uses errorInlineUnavailable as label if name availability is error", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "DESIGNATOR_ERROR" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
          businessNameAvailability,
        }).label
      ).toEqual(Config.formation.fields.businessName.errorInlineUnavailable);
    });

    it("uses field name as label if name availability is AVAILABLE", () => {
      const formationFormData = generateFormationFormData({ businessName: "some name" });
      const businessNameAvailability = generateBusinessNameAvailability({ status: "AVAILABLE" });
      expect(
        getErrorStateForField({
          field: "businessName",
          formationFormData,
          businessNameAvailability,
        }).label
      ).toEqual(Config.formation.fields.businessName.label);
    });
  });

  describe("foreignDateOfFormation", () => {
    it("has error if empty", () => {
      const formationFormData = generateFormationFormData({ foreignDateOfFormation: undefined });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formationFormData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has no error in the past", () => {
      const formationFormData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).hasError
      ).toEqual(false);
    });

    it("has no error if today", () => {
      const formationFormData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).hasError
      ).toEqual(false);
    });

    it("has no error if in the future", () => {
      const formationFormData = generateFormationFormData({
        foreignDateOfFormation: getCurrentDate().add(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).hasError
      ).toEqual(false);
    });

    it("inserts label from config", () => {
      const formationFormData = generateFormationFormData({ foreignDateOfFormation: "1234567" });
      expect(
        getErrorStateForField({
          field: "foreignDateOfFormation",
          formationFormData,
        }).label
      ).toEqual(Config.formation.fields.foreignDateOfFormation.error);
    });
  });

  describe("businessStartDate", () => {
    it("has error if empty", () => {
      const formationFormData = generateFormationFormData({ businessStartDate: "" });
      expect(
        getErrorStateForField({
          field: "businessStartDate",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has error if invalid date", () => {
      const formationFormData = generateFormationFormData({ businessStartDate: "1234567" });
      expect(
        getErrorStateForField({
          field: "businessStartDate",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has error in the past", () => {
      const formationFormData = generateFormationFormData({
        businessStartDate: getCurrentDate().subtract(1, "day").format(defaultDateFormat),
      });
      expect(
        getErrorStateForField({
          field: "businessStartDate",
          formationFormData,
        }).hasError
      ).toEqual(true);
    });

    it("has no error if today", () => {
      const formationFormData = generateFormationFormData({
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
      });
      expect(
        getErrorStateForField({
          field: "businessStartDate",
          formationFormData,
        }).hasError
      ).toEqual(false);
    });

    describe("future date validation", () => {
      const testFutureDates = (
        legalStructureIds: FormationLegalType[],
        additionalDays: number,
        error: boolean
      ): void => {
        legalStructureIds.map((legalStructureId) =>
          describe(`for ${legalStructureId}`, () => {
            it(`has${error ? " " : " no "}error if in the future`, () => {
              const formationFormData = generateFormationFormData(
                {
                  businessStartDate: getCurrentDate().add(additionalDays, "day").format(defaultDateFormat),
                },
                { legalStructureId }
              );
              expect(
                getErrorStateForField({
                  field: "businessStartDate",
                  formationFormData,
                }).hasError
              ).toEqual(error);
            });
          })
        );
      };

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
      const formationFormData = generateFormationFormData({
        businessStartDate: getCurrentDate().add(1, "day").format(defaultDateFormat),
      });
      expect(getErrorStateForField({ field: "businessStartDate", formationFormData }).label).toEqual(
        Config.formation.fields.businessStartDate.label
      );
    });
  });

  describe("addressZipCode", () => {
    describe("foreign", () => {
      const legalStructureId = "foreign-limited-liability-company";

      it("has error if empty", () => {
        const formationFormData = generateFormationFormData({ addressZipCode: "" }, { legalStructureId });
        expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(true);
      });

      it("inserts label from config", () => {
        const formationFormData = generateFormationFormData(
          { addressZipCode: "08100" },
          { legalStructureId }
        );
        expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).label).toEqual(
          Config.formation.fields.addressZipCode.error
        );
      });

      describe("US", () => {
        it("has no error if outside of NJ range", () => {
          const formationFormData = generateFormationFormData(
            { addressZipCode: "12345", businessLocationType: "US" },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            false
          );
        });

        it("has error if less than 5 digits long", () => {
          const formationFormData = generateFormationFormData(
            { addressZipCode: "0810", businessLocationType: "US" },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            true
          );
        });

        it("has error if more than 5 digits long", () => {
          const formationFormData = generateFormationFormData(
            { addressZipCode: "1231245", businessLocationType: "US" },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            true
          );
        });
      });

      describe("INTL", () => {
        it("has no error if more than 5", () => {
          const formationFormData = generateFormationFormData(
            {
              addressZipCode: "1231245",
              businessLocationType: "INTL",
            },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            false
          );
        });

        it("has no error if equal to or less than 11 digits in length", () => {
          const formationFormData = generateFormationFormData(
            {
              addressZipCode: "12345678912",
              businessLocationType: "INTL",
            },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            false
          );
        });

        it("has error if greater than 11 digits in length", () => {
          const formationFormData = generateFormationFormData(
            {
              addressZipCode: "123456789124",
              businessLocationType: "INTL",
            },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            true
          );
        });

        it("has error if zip code has no characters", () => {
          const formationFormData = generateFormationFormData(
            { addressZipCode: "", businessLocationType: "INTL" },
            { legalStructureId }
          );
          expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(
            true
          );
        });
      });
    });

    describe("domestic", () => {
      const legalStructureId = "limited-liability-company";

      it("has error if not in range", () => {
        const formationFormData = generateFormationFormData(
          { addressZipCode: "12345", businessLocationType: "NJ" },
          { legalStructureId }
        );
        expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(true);
      });

      it("has no error if in range", () => {
        const formationFormData = generateFormationFormData(
          { addressZipCode: "08100", businessLocationType: "NJ" },
          { legalStructureId }
        );
        expect(getErrorStateForField({ field: "addressZipCode", formationFormData }).hasError).toEqual(false);
      });

      it("has partial address error when it is missing and addressLine1 exists", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "some-stuff",
            addressZipCode: "",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressZipCode", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressMunicipality exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressZipCode: "",
            addressMunicipality: generateMunicipality({}),
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressZipCode", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressMunicipality and addressLine1 both exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "some-stuff",
            addressMunicipality: generateMunicipality({}),
            addressZipCode: "",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressZipCode", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has no error when it is missing and addressMunicipality and addressLine1 are also missing", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressMunicipality: undefined,
            addressZipCode: "",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressZipCode", formationFormData });
        expect(errorState.hasError).toEqual(false);
      });
    });
  });

  describe("agentOfficeAddressZipCode", () => {
    it("has error if empty", () => {
      const formationFormData = generateFormationFormData({ agentOfficeAddressZipCode: "" });
      expect(
        getErrorStateForField({ field: "agentOfficeAddressZipCode", formationFormData }).hasError
      ).toEqual(true);
    });

    it("has error if not in range", () => {
      const formationFormData = generateFormationFormData({ agentOfficeAddressZipCode: "12345" });
      expect(
        getErrorStateForField({ field: "agentOfficeAddressZipCode", formationFormData }).hasError
      ).toEqual(true);
    });

    it("has no error if in range", () => {
      const formationFormData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(
        getErrorStateForField({ field: "agentOfficeAddressZipCode", formationFormData }).hasError
      ).toEqual(false);
    });

    it("inserts label from config", () => {
      const formationFormData = generateFormationFormData({ agentOfficeAddressZipCode: "08100" });
      expect(getErrorStateForField({ field: "agentOfficeAddressZipCode", formationFormData }).label).toEqual(
        Config.formation.fields.agentOfficeAddressZipCode.label
      );
    });
  });

  describe("agentEmail", () => {
    it("has error if empty", () => {
      const formationFormData = generateFormationFormData({ agentEmail: "" });
      const errorState = getErrorStateForField({ field: "agentEmail", formationFormData });
      expect(errorState.hasError).toEqual(true);
      expect(errorState.label).toEqual(Config.formation.fields.agentEmail.error);
    });

    it("has error if not valid email format", () => {
      const formData1 = generateFormationFormData({ agentEmail: "whatever@" });
      const errorState1 = getErrorStateForField({ field: "agentEmail", formationFormData: formData1 });
      expect(errorState1.hasError).toEqual(true);
      expect(errorState1.label).toEqual(Config.formation.fields.agentEmail.error);

      const formData2 = generateFormationFormData({ agentEmail: "whatever@thing" });
      const errorState2 = getErrorStateForField({ field: "agentEmail", formationFormData: formData2 });
      expect(errorState2.hasError).toEqual(true);
      expect(errorState2.label).toEqual(Config.formation.fields.agentEmail.error);

      const formData3 = generateFormationFormData({ agentEmail: "stuff" });
      const errorState3 = getErrorStateForField({ field: "agentEmail", formationFormData: formData3 });
      expect(errorState3.hasError).toEqual(true);
      expect(errorState3.label).toEqual(Config.formation.fields.agentEmail.error);
    });

    it("has error if valid-format length is greater than 50 chars", () => {
      const longFormEntry = `${Array(43).fill("A").join("")}@aol.com`;
      const formationFormData = generateFormationFormData({ agentEmail: longFormEntry });
      const errorState = getErrorStateForField({ field: "agentEmail", formationFormData });
      expect(errorState.hasError).toEqual(true);
      expect(errorState.label).toEqual(
        templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentEmail.label,
          maxLen: "50",
        })
      );
    });

    it("has no error if valid-format length is less than or equal to 50 chars", () => {
      const longFormEntry = `${Array(42).fill("A").join("")}@aol.com`;
      const formationFormData = generateFormationFormData({ agentEmail: longFormEntry });
      const errorState = getErrorStateForField({ field: "agentEmail", formationFormData });
      expect(errorState.hasError).toEqual(false);
    });
  });

  describe("agentOfficeAddressMunicipality", () => {
    it("has error if undefined", () => {
      const formationFormData = generateFormationFormData({ agentOfficeAddressMunicipality: undefined });
      expect(
        getErrorStateForField({ field: "agentOfficeAddressMunicipality", formationFormData }).hasError
      ).toEqual(true);
    });

    it("inserts label from config", () => {
      const formationFormData = generateFormationFormData({
        agentOfficeAddressMunicipality: generateMunicipality({}),
      });
      expect(
        getErrorStateForField({ field: "agentOfficeAddressMunicipality", formationFormData }).label
      ).toEqual(Config.formation.fields.agentOfficeAddressMunicipality.label);
    });
  });

  describe(`incorporator and signer fields`, () => {
    (["signers", "incorporators"] as ("signers" | "incorporators")[]).map((field) => {
      const generator = field === "signers" ? generateFormationSigner : generateFormationIncorporator;
      return describe(`${field}`, () => {
        it(`has NAME-labelled error when some ${field} do not have a name`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "", signature: true }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerName
          );
        });

        it(`has NAME-labelled error when some ${field} name is just whitespace`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [generator({ name: " ", signature: true })],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerName
          );
        });

        it(`has CHECKBOX-labelled error when some ${field} are not checked`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: false }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerCheckbox
          );
        });

        it(`has TYPE-labelled error when some ${field} are not set`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: "some-name", signature: true, title: "" }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerTitle
          );
        });

        it(`has MAX-LENGTH-labelled error when some ${field} names are too long`, () => {
          const tooLongName = Array(51).fill("A").join("");
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: tooLongName, signature: true }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            templateEval(Config.formation.general.maximumLengthErrorText, {
              field: Config.formation.fields.signers.label,
              maxLen: "50",
            })
          );
        });

        it(`has MINIMUM-labelled error when length of ${field} is 0`, () => {
          const formationFormData = generateFormationFormData({ [field]: [] });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerMinimum
          );
        });

        it(`shows NAME error before CHECKBOX error if ${field} is missing both`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "", signature: true }),
              generator({ name: "some-name", signature: false }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          expect(getErrorStateForField({ field, formationFormData }).label).toEqual(
            Config.formation.fields.signers.errorBannerSignerName
          );
        });

        it(`has no error when all ${field} have name and checkbox`, () => {
          const formationFormData = generateFormationFormData({
            [field]: [
              generator({ name: "some-name", signature: true }),
              generator({ name: "some-name", signature: true }),
            ],
          });
          expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(false);
        });

        if (field === "incorporators") {
          it(`has error if some incorporators missing city and municipality`, () => {
            const formationFormData = generateFormationFormData({
              incorporators: [
                generateFormationIncorporator({ addressCity: "", addressMunicipality: undefined }),
              ],
            });
            expect(getErrorStateForField({ field: "incorporators", formationFormData }).hasError).toEqual(
              true
            );
          });

          it(`has error if some incorporators missing addressLine1`, () => {
            const formationFormData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressLine1: "" })],
            });
            expect(getErrorStateForField({ field: "incorporators", formationFormData }).hasError).toEqual(
              true
            );
          });

          it(`has error if some incorporators missing state`, () => {
            const formationFormData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressState: undefined })],
            });
            expect(getErrorStateForField({ field: "incorporators", formationFormData }).hasError).toEqual(
              true
            );
          });

          it(`has error if some incorporators missing zip code`, () => {
            const formationFormData = generateFormationFormData({
              incorporators: [generateFormationIncorporator({ addressZipCode: "" })],
            });
            expect(getErrorStateForField({ field: "incorporators", formationFormData }).hasError).toEqual(
              true
            );
          });
        }
      });
    });
  });

  describe("members", () => {
    it("has MINIMUM-labelled error when members length is 0", () => {
      const formationFormData = generateFormationFormData({ members: [] });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
      expect(getErrorStateForField({ field: "members", formationFormData }).label).toEqual(
        Config.formation.fields.directors.error
      );
    });

    it("has no error when members exist", () => {
      const formationFormData = generateFormationFormData({ members: [generateFormationMember({})] });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(false);
    });

    it("has error if some members missing name", () => {
      const formationFormData = generateFormationFormData({
        members: [generateFormationMember({ name: "" })],
      });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
    });

    it("has error if some members missing city and municipality", () => {
      const formationFormData = generateFormationFormData({
        members: [generateFormationMember({ addressCity: "", addressMunicipality: undefined })],
      });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
    });

    it("has error if some members missing addressLine1", () => {
      const formationFormData = generateFormationFormData({
        members: [generateFormationMember({ addressLine1: "" })],
      });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
    });

    it("has error if some members missing state", () => {
      const formationFormData = generateFormationFormData({
        members: [generateFormationMember({ addressState: undefined })],
      });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
    });

    it("has error if some members missing zip code", () => {
      const formationFormData = generateFormationFormData({
        members: [generateFormationMember({ addressZipCode: "" })],
      });
      expect(getErrorStateForField({ field: "members", formationFormData }).hasError).toEqual(true);
    });
  });

  describe("addressLine1", () => {
    describe("when foreign", () => {
      const legalStructureId = "foreign-limited-liability-company";

      it("has error and label if empty", () => {
        const formationFormData = generateFormationFormData({ addressLine1: "" }, { legalStructureId });
        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.fields.addressLine1.error);
      });

      it("has error if length is greater than 35 chars", () => {
        const longFormEntry = Array(36).fill("A").join("");
        const formationFormData = generateFormationFormData(
          { addressLine1: longFormEntry },
          { legalStructureId }
        );
        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        const expectedLabel = templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine1.label,
          maxLen: "35",
        });
        expect(errorState.label).toEqual(expectedLabel);
      });

      it("has no error if length is less than or equal to 35 chars", () => {
        const longFormEntry = Array(35).fill("A").join("");
        const formationFormData = generateFormationFormData(
          { addressLine1: longFormEntry },
          { legalStructureId }
        );
        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(false);
      });
    });

    describe("when domestic", () => {
      const legalStructureId = "limited-liability-company";

      it("has max length error when more than 35 characters", () => {
        const tooLongData = Array(36).fill("A").join("");
        const formationFormData = generateFormationFormData(
          { addressLine1: tooLongData },
          { legalStructureId }
        );
        const expectedLabel = templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressLine1.label,
          maxLen: "35",
        });

        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(expectedLabel);
      });

      it(`has no error if length is less than or equal to 35 chars`, () => {
        const longFormEntry = Array(35).fill("A").join("");
        const formationFormData = generateFormationFormData(
          { addressLine1: longFormEntry },
          { legalStructureId }
        );
        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(false);
      });

      it("has partial address error when it is missing and addressZipCode exists", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressZipCode: "08100",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressMunicipality exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressMunicipality: generateMunicipality({}),
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressMunicipality and addressZipCode both exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressMunicipality: generateMunicipality({}),
            addressZipCode: "08100",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has no error when it is missing and addressMunicipality and addressZipCode are also missing", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressMunicipality: undefined,
            addressZipCode: "",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressLine1", formationFormData });
        expect(errorState.hasError).toEqual(false);
      });
    });
  });

  describe("addressMunicipality", () => {
    describe("when domestic", () => {
      const legalStructureId = "limited-liability-company";

      it("has partial address error when it is missing and addressZipCode exists", () => {
        const formationFormData = generateFormationFormData(
          {
            addressMunicipality: undefined,
            addressZipCode: "08100",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressMunicipality", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressLine1 exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "some-stuff",
            addressMunicipality: undefined,
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressMunicipality", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has partial address error when it is missing and addressLine1 and addressZipCode both exist", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "some-stuff",
            addressMunicipality: undefined,
            addressZipCode: "08100",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressMunicipality", formationFormData });
        expect(errorState.hasError).toEqual(true);
        expect(errorState.label).toEqual(Config.formation.general.partialAddressErrorText);
      });

      it("has no error when it is missing and addressMunicipality and addressZipCode are also missing", () => {
        const formationFormData = generateFormationFormData(
          {
            addressLine1: "",
            addressMunicipality: undefined,
            addressZipCode: "",
          },
          { legalStructureId }
        );

        const errorState = getErrorStateForField({ field: "addressMunicipality", formationFormData });
        expect(errorState.hasError).toEqual(false);
      });
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
        field: "addressCity",
        maxLen: 30,
        labelWhenMissing: Config.formation.fields.addressCity.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.addressCity.label,
          maxLen: "30",
        }),
      },
      {
        field: "agentName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.agentName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentName.label,
          maxLen: "50",
        }),
      },
      {
        field: "contactFirstName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.contactFirstName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.contactFirstName.label,
          maxLen: "50",
        }),
      },
      {
        field: "contactLastName",
        maxLen: 50,
        labelWhenMissing: Config.formation.fields.contactLastName.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.contactLastName.label,
          maxLen: "50",
        }),
      },
      {
        field: "agentOfficeAddressLine1",
        maxLen: 35,
        labelWhenMissing: Config.formation.fields.agentOfficeAddressLine1.error,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentOfficeAddressLine1.label,
          maxLen: "35",
        }),
      },
    ];

    for (const data of fieldData) {
      describe(`${data.field}`, () => {
        it("has error and label if empty", () => {
          const formationFormData = generateFormationFormData({ [data.field]: "" });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenMissing);
        });

        it("has error and label if undefined", () => {
          const formationFormData = generateFormationFormData({ [data.field]: undefined });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenMissing);
        });

        it(`has error if length is greater than ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen + 1)
            .fill("A")
            .join("");
          const formationFormData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenTooLong);
        });

        it(`has no error if length is less than or equal to ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen).fill("A").join("");
          const formationFormData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
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
          field: Config.formation.fields.addressLine2.label,
          maxLen: "35",
        }),
      },
      {
        field: "agentOfficeAddressLine2",
        maxLen: 35,
        labelWhenTooLong: templateEval(Config.formation.general.maximumLengthErrorText, {
          field: Config.formation.fields.agentOfficeAddressLine2.label,
          maxLen: "35",
        }),
      },
    ];

    for (const data of fieldData) {
      describe(`${data.field}`, () => {
        it("has no error if empty", () => {
          const formationFormData = generateFormationFormData({ [data.field]: "" });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
          expect(errorState.hasError).toEqual(false);
        });

        it(`has error if length is greater than ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen + 1)
            .fill("A")
            .join("");
          const formationFormData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
          expect(errorState.hasError).toEqual(true);
          expect(errorState.label).toEqual(data.labelWhenTooLong);
        });

        it(`has no error if length is less than or equal to ${data.maxLen} chars`, () => {
          const longFormEntry = Array(data.maxLen).fill("A").join("");
          const formationFormData = generateFormationFormData({ [data.field]: longFormEntry });
          const errorState = getErrorStateForField({ field: data.field, formationFormData });
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
      "willPracticeLaw",
    ];

    const runTests = (hasErrorIfUndefined: FormationFields[], expectedLabel?: string): void => {
      for (const field of hasErrorIfUndefined) {
        describe(`${field}`, () => {
          it("has error if undefined", () => {
            const formationFormData = generateFormationFormData({ [field]: undefined });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          });

          it("has no error if false", () => {
            const formationFormData = generateFormationFormData({ [field]: false });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(false);
          });

          it("has no error if value", () => {
            const formationFormData = generateFormationFormData({ [field]: "some-value" });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(false);
          });

          it("inserts label from config", () => {
            const formationFormData = generateFormationFormData({ [field]: undefined });
            const label = expectedLabel ?? (Config.formation.fields as any)[field].label;
            if (!label) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField({ field, formationFormData }).label).toEqual(label);
          });
        });
      }
    };

    runTests(hasErrorIfUndefined);

    runTests(["foreignStateOfFormation"], Config.formation.fields.foreignStateOfFormation.error);
    runTests(["foreignStateOfFormation"], Config.formation.fields.foreignStateOfFormation.error);
  });

  describe("foreignGoodStandingFile", () => {
    const field = "foreignGoodStandingFile";

    it("has error if undefined", () => {
      const formationFormData = generateFormationFormData({});
      expect(
        getErrorStateForField({
          field,
          formationFormData,
          foreignGoodStandingFile: undefined,
        }).hasError
      ).toEqual(true);
    });

    it("has no error if value", () => {
      const formationFormData = generateFormationFormData({});
      const foreignGoodStandingFile = generateInputFile({});
      expect(getErrorStateForField({ field, formationFormData, foreignGoodStandingFile }).hasError).toEqual(
        false
      );
    });

    it("inserts label from config", () => {
      const formationFormData = generateFormationFormData({});
      const label = (Config.formation.fields as any)[field].errorMessageRequired;
      if (!label) {
        throw `label missing in config for ${field}`;
      }
      expect(getErrorStateForField({ field, formationFormData }).label).toEqual(label);
    });
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

    const runTests = (hasErrorIfEmpty: FormationFields[]): void => {
      for (const field of hasErrorIfEmpty) {
        describe(`${field}`, () => {
          it("has error if empty", () => {
            const formationFormData = generateFormationFormData({ [field]: "" });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          });

          it("has error if undefined", () => {
            const formationFormData = generateFormationFormData({ [field]: undefined });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(true);
          });

          it("has no error if value", () => {
            const formationFormData = generateFormationFormData({ [field]: "some-value" });
            expect(getErrorStateForField({ field, formationFormData }).hasError).toEqual(false);
          });

          it("inserts label from config", () => {
            const formationFormData = generateFormationFormData({ [field]: "some-value" });
            const expectedLabel = (Config.formation.fields as any)[field].label;
            if (!expectedLabel) {
              throw `label missing in config for ${field}`;
            }
            expect(getErrorStateForField({ field, formationFormData }).label).toEqual(expectedLabel);
          });
        });
      }
    };

    runTests(hasErrorIfEmpty);
  });
});
