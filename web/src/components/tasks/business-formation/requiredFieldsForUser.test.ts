import { requiredFieldsForUser } from "@/components/tasks/business-formation/requiredFieldsForUser";
import { generateFormationFormData, randomLegalStructure } from "@/test/factories";
import { FormationFields, FormationLegalType } from "@businessnjgovnavigator/shared/formationData";

describe("requiredFieldsForUser", () => {
  const requiredFieldsForAllLegalStructures: FormationFields[] = [
    "businessName",
    "businessSuffix",
    "businessStartDate",
    "businessAddressCity",
    "businessAddressLine1",
    "businessAddressZipCode",
    "signers",
    "paymentType",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
  ];

  describe("registeredAgent", () => {
    it("requires registered agent fields for MANUAL_ENTRY for all legal structures", () => {
      const legalStructureId = randomLegalStructure().id as FormationLegalType;
      const formationFormData = generateFormationFormData({ agentNumberOrManual: "MANUAL_ENTRY" });

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ];

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(expected)
      );
    });

    it("requires registered agent fields for NUMBER for all legal structures", () => {
      const legalStructureId = randomLegalStructure().id as FormationLegalType;
      const formationFormData = generateFormationFormData({ agentNumberOrManual: "NUMBER" });

      const expected: FormationFields[] = [...requiredFieldsForAllLegalStructures, "agentNumber"];

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(expected)
      );
    });
  });

  describe("LLC", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-company";
      const formationFormData = generateFormationFormData({});

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(requiredFieldsForAllLegalStructures)
      );
    });
  });

  describe("LLP", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-partnership";
      const formationFormData = generateFormationFormData({});

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(requiredFieldsForAllLegalStructures)
      );
    });
  });

  describe("s-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "s-corporation";
      const formationFormData = generateFormationFormData({});

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
      ];
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(expected)
      );
    });
  });

  describe("c-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "c-corporation";
      const formationFormData = generateFormationFormData({});

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
      ];
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(expected)
      );
    });
  });

  describe("LP", () => {
    it("also requires LP fields for NO answers to radio questions", () => {
      const legalStructureId = "limited-partnership";
      const formationFormData = generateFormationFormData({
        canCreateLimitedPartner: false,
        canGetDistribution: false,
        canMakeDistribution: false,
      });

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "withdrawals",
        "combinedInvestment",
        "dissolution",
        "canCreateLimitedPartner",
        "canGetDistribution",
        "canMakeDistribution",
      ];
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toEqual(
        expect.arrayContaining(expected)
      );
    });

    it("also terms fields for YES answer to canCreateLimitedPartner", () => {
      const legalStructureId = "limited-partnership";
      const formationFormData = generateFormationFormData({
        canCreateLimitedPartner: true,
        canGetDistribution: false,
        canMakeDistribution: false,
      });

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain(
        "createLimitedPartnerTerms"
      );
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).not.toContain(
        "getDistributionTerms"
      );
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).not.toContain(
        "makeDistributionTerms"
      );
    });

    it("also terms fields for YES answer to canGetDistribution", () => {
      const legalStructureId = "limited-partnership";
      const formationFormData = generateFormationFormData({
        canCreateLimitedPartner: true,
        canGetDistribution: true,
        canMakeDistribution: false,
      });

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain(
        "createLimitedPartnerTerms"
      );
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain("getDistributionTerms");
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).not.toContain(
        "makeDistributionTerms"
      );
    });

    it("also terms fields for YES answer to canMakeDistribution", () => {
      const legalStructureId = "limited-partnership";
      const formationFormData = generateFormationFormData({
        canCreateLimitedPartner: true,
        canGetDistribution: true,
        canMakeDistribution: true,
      });

      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain(
        "createLimitedPartnerTerms"
      );
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain("getDistributionTerms");
      expect(requiredFieldsForUser(legalStructureId, formationFormData)).toContain("makeDistributionTerms");
    });
  });
});
