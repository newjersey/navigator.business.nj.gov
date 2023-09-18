import { validatedFieldsForUser } from "@/components/tasks/business-formation/validatedFieldsForUser";
import {
  FormationFields,
  generateFormationFormData,
  randomFormationLegalType,
} from "@businessnjgovnavigator/shared";

describe("validatedFieldsForUser", () => {
  const validatedFieldsForAllLegalStructures: FormationFields[] = [
    "businessName",
    "businessSuffix",
    "businessStartDate",
    "addressLine1",
    "addressLine2",
    "addressZipCode",
    "paymentType",
    "contactFirstName",
    "contactLastName",
    "contactPhoneNumber",
  ];

  const foreignValidatedFields: FormationFields[] = [
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

      const expected: FormationFields[] = [...foreignValidatedFields, "addressProvince", "addressCountry"];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("requires US address fields for foreign legal structure", () => {
      const formationFormData = generateFormationFormData(
        { businessLocationType: "US" },
        { legalStructureId: "foreign-limited-liability-company" }
      );

      const expected: FormationFields[] = [...foreignValidatedFields, "addressState"];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
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
        "agentOfficeAddressLine2",
        "agentOfficeAddressMunicipality",
        "agentOfficeAddressZipCode",
      ];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });

    it("requires registered agent fields for NUMBER for all legal structures", () => {
      const legalStructureId = randomFormationLegalType();
      const formationFormData = generateFormationFormData(
        { agentNumberOrManual: "NUMBER" },
        { legalStructureId }
      );

      const expected: FormationFields[] = ["agentNumber"];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("LLC", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-company";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [...validatedFieldsForAllLegalStructures, "signers"];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("LLP", () => {
    it("requires shared fields", () => {
      const legalStructureId = "limited-liability-partnership";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [...validatedFieldsForAllLegalStructures, "signers"];

      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("s-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "s-corporation";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [
        ...validatedFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
        "incorporators",
      ];
      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
    });
  });

  describe("c-corporation", () => {
    it("also requires businessTotalStock, members", () => {
      const legalStructureId = "c-corporation";
      const formationFormData = generateFormationFormData({}, { legalStructureId });

      const expected: FormationFields[] = [
        ...validatedFieldsForAllLegalStructures,
        "businessTotalStock",
        "members",
        "incorporators",
      ];
      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
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
        ...validatedFieldsForAllLegalStructures,
        "withdrawals",
        "combinedInvestment",
        "dissolution",
        "canCreateLimitedPartner",
        "canGetDistribution",
        "canMakeDistribution",
        "incorporators",
      ];
      expect(validatedFieldsForUser(formationFormData)).toEqual(expect.arrayContaining(expected));
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

      expect(validatedFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("getDistributionTerms");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("makeDistributionTerms");
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

      expect(validatedFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("getDistributionTerms");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("makeDistributionTerms");
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

      expect(validatedFieldsForUser(formationFormData)).toContain("createLimitedPartnerTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("getDistributionTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("makeDistributionTerms");
    });
  });

  describe("nonprofit", () => {
    const legalStructureId = "nonprofit";

    it("isVeteranNonprofit and Provisions radio questions does not have a response", () => {
      const formationFormData = generateFormationFormData(
        { hasNonprofitBoardMembers: undefined },
        { legalStructureId }
      );

      const expected: FormationFields[] = [
        ...validatedFieldsForAllLegalStructures,
        "isVeteranNonprofit",
        "hasNonprofitBoardMembers",
        "members",
        "incorporators",
      ];

      const validatedFieldsArray = validatedFieldsForUser(formationFormData);
      expect(validatedFieldsArray).toEqual(expect.arrayContaining(expected));
      expect(validatedFieldsArray).not.toContain("nonprofitBoardMemberQualificationsSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitBoardMemberRightsSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitTrusteesMethodSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitAssetDistributionSpecified");
    });

    it("isVeteranNonprofit and hasNonprofitBoardMembers radio questions are no", () => {
      const formationFormData = generateFormationFormData(
        { hasNonprofitBoardMembers: false },
        { legalStructureId }
      );

      const expected: FormationFields[] = [
        ...validatedFieldsForAllLegalStructures,
        "isVeteranNonprofit",
        "hasNonprofitBoardMembers",
        "members",
        "incorporators",
      ];

      const validatedFieldsArray = validatedFieldsForUser(formationFormData);
      expect(validatedFieldsArray).toEqual(expect.arrayContaining(expected));
      expect(validatedFieldsArray).not.toContain("nonprofitBoardMemberQualificationsSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitBoardMemberRightsSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitTrusteesMethodSpecified");
      expect(validatedFieldsArray).not.toContain("nonprofitAssetDistributionSpecified");
    });

    it("displays hasNonprofitBoardMembers questions when hasNonprofitBoardMembers is true", () => {
      const formationFormData = generateFormationFormData(
        { hasNonprofitBoardMembers: true },
        { legalStructureId }
      );

      const expected: FormationFields[] = [
        "isVeteranNonprofit",
        "hasNonprofitBoardMembers",
        "members",
        "incorporators",
        "nonprofitBoardMemberQualificationsSpecified",
        "nonprofitBoardMemberRightsSpecified",
        "nonprofitTrusteesMethodSpecified",
        "nonprofitAssetDistributionSpecified",
      ];

      const validatedFieldsArray = validatedFieldsForUser(formationFormData);
      expect(validatedFieldsArray).toEqual(expect.arrayContaining(expected));
    });

    it("requires terms when radio question is true / IN_FORM", () => {
      const formationFormData = generateFormationFormData(
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberQualificationsSpecified: "IN_FORM",
          nonprofitBoardMemberRightsSpecified: "IN_FORM",
          nonprofitTrusteesMethodSpecified: "IN_FORM",
          nonprofitAssetDistributionSpecified: "IN_FORM",
        },
        { legalStructureId }
      );

      expect(validatedFieldsForUser(formationFormData)).toContain("nonprofitBoardMemberQualificationsTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("nonprofitBoardMemberRightsTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("nonprofitTrusteesMethodTerms");
      expect(validatedFieldsForUser(formationFormData)).toContain("nonprofitAssetDistributionTerms");
    });

    it("does not require terms when radio question is false / IN_BYLAWS", () => {
      const formationFormData = generateFormationFormData(
        {
          hasNonprofitBoardMembers: false,
          nonprofitBoardMemberQualificationsSpecified: "IN_BYLAWS",
          nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
          nonprofitTrusteesMethodSpecified: "IN_BYLAWS",
          nonprofitAssetDistributionSpecified: "IN_BYLAWS",
        },
        { legalStructureId }
      );

      expect(validatedFieldsForUser(formationFormData)).not.toContain(
        "nonprofitBoardMemberQualificationsTerms"
      );
      expect(validatedFieldsForUser(formationFormData)).not.toContain("nonprofitBoardMemberRightsTerms");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("nonprofitTrusteesMethodTerms");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("nonprofitAssetDistributionTerms");
    });
  });

  describe("foreign c-corp", () => {
    it("requires 'practice law' and 'certificate of good standing' fields", () => {
      const formationFormData = generateFormationFormData({}, { legalStructureId: "foreign-c-corporation" });
      expect(validatedFieldsForUser(formationFormData)).toContain("willPracticeLaw");
      expect(validatedFieldsForUser(formationFormData)).toContain("foreignGoodStandingFile");
    });
  });

  describe("foreign nonprofit", () => {
    it("requires 'certificate of good standing' field", () => {
      const formationFormData = generateFormationFormData({}, { legalStructureId: "foreign-nonprofit" });
      expect(validatedFieldsForUser(formationFormData)).toContain("foreignGoodStandingFile");
      expect(validatedFieldsForUser(formationFormData)).not.toContain("willPracticeLaw");
    });
  });
});
