import { requiredFieldsForUser } from "@/components/tasks/business-formation/requiredFieldsForUser";
import {
  FormationFields,
  generateFormationFormData,
  randomFormationLegalType,
} from "@businessnjgovnavigator/shared";

describe("requiredFieldsForUser", () => {
  const requiredFieldsForAllLegalStructures: FormationFields[] = [
    "businessName",
    "businessSuffix",
    "businessStartDate",
    "addressLine1",
    "addressZipCode",
    "paymentType",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
  ];

  const foreignRequired: FormationFields[] = [
    "addressCity",
    "foreignDateOfFormation",
    "foreignStateOfFormation",
  ];

  describe("addressFields", () => {
    it("requires INTL address fields for foreign legal structure", () => {
      const formationFormData = generateFormationFormData(
        { businessLocationType: "INTL" },
        { legalStructureId: "foreign-limited-liability-company" }
      );

      const expected: FormationFields[] = [...foreignRequired, "addressProvince", "addressCountry"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("requires US address fields for foreign legal structure", () => {
      const formationFormData = generateFormationFormData(
        { businessLocationType: "US" },
        { legalStructureId: "foreign-limited-liability-company" }
      );

      const expected: FormationFields[] = [...foreignRequired, "addressState"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("requires NJ address fields for domestic legal structure", () => {
      const formationFormData = generateFormationFormData(
        { businessLocationType: "NJ" },
        { legalStructureId: "limited-liability-company" }
      );

      const expected: FormationFields[] = ["addressMunicipality"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("registeredAgent", () => {
    it("requires registered agent fields for MANUAL_ENTRY for all legal structures", () => {
      const legalStructureId = randomFormationLegalType();
      const formationFormData = generateFormationFormData(
        { agentNumberOrManual: "MANUAL_ENTRY" },
        { legalStructureId }
      );

      const expected: FormationFields[] = [
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressMunicipality",
        "agentOfficeAddressZipCode",
      ];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("requires registered agent fields for NUMBER for all legal structures", () => {
      const legalStructureId = randomFormationLegalType();
      const formationFormData = generateFormationFormData(
        { agentNumberOrManual: "NUMBER" },
        { legalStructureId }
      );

      const expected: FormationFields[] = ["agentNumber"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("LLC", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-company";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [...requiredFieldsForAllLegalStructures, "signers"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("LLP", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-partnership";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [...requiredFieldsForAllLegalStructures, "signers"];

      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("s-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "s-corporation";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
        "incorporators",
      ];
      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("c-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "c-corporation";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
        "incorporators",
      ];
      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("LP", () => {
    const legalStructureId = "limited-partnership";

    it("also requires LP fields for NO answers to radio questions", () => {
      const formationFormData = generateFormationFormData(
        {
          canCreateLimitedPartner: false,
          canGetDistribution: false,
          canMakeDistribution: false,
        },
        { legalStructureId }
      );

      const expected: FormationFields[] = [
        ...requiredFieldsForAllLegalStructures,
        "withdrawals",
        "combinedInvestment",
        "dissolution",
        "canCreateLimitedPartner",
        "canGetDistribution",
        "canMakeDistribution",
        "incorporators",
      ];
      expect(requiredFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("also terms fields for YES answer to canCreateLimitedPartner", () => {
      const formationFormData = generateFormationFormData(
        {
          legalType: "limited-partnership",
          canCreateLimitedPartner: true,
          canGetDistribution: false,
          canMakeDistribution: false,
        },
        { legalStructureId }
      );

      expect(requiredFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(requiredFieldsForUser(formationFormData)).not.toContain("getDistributionTerms");
      expect(requiredFieldsForUser(formationFormData)).not.toContain("makeDistributionTerms");
    });

    it("also terms fields for YES answer to canGetDistribution", () => {
      const formationFormData = generateFormationFormData(
        {
          canCreateLimitedPartner: true,
          canGetDistribution: true,
          canMakeDistribution: false,
        },
        { legalStructureId }
      );

      expect(requiredFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(requiredFieldsForUser(formationFormData)).toContain("getDistributionTerms");
      expect(requiredFieldsForUser(formationFormData)).not.toContain("makeDistributionTerms");
    });

    it("also terms fields for YES answer to canMakeDistribution", () => {
      const formationFormData = generateFormationFormData(
        {
          canCreateLimitedPartner: true,
          canGetDistribution: true,
          canMakeDistribution: true,
        },
        { legalStructureId }
      );

      expect(requiredFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(requiredFieldsForUser(formationFormData)).toContain("getDistributionTerms");
      expect(requiredFieldsForUser(formationFormData)).toContain("makeDistributionTerms");
    });
  });
});
