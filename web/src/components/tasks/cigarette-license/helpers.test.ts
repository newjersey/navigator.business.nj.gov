import {
  getInitialData,
  isAnyRequiredFieldEmpty,
} from "@/components/tasks/cigarette-license/helpers";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateProfileData,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";

describe("getInitialData", () => {
  it("should prioritize cigaretteLicenseData over other sources", () => {
    const business = generateBusiness({
      cigaretteLicenseData: generateCigaretteLicenseData({
        businessName: "Cigarette Business",
        responsibleOwnerName: "Cigarette Owner",
        tradeName: "Cigarette Trade",
        taxId: "cigarette-tax-123",
        addressLine1: "456 Cigarette St",
        contactName: "Cigarette Contact",
        contactEmail: "cigarette@email.com",
        mailingAddressIsTheSame: true,
        salesInfoSupplier: ["Supplier1", "Supplier2"],
        lastUpdatedISO: "2023-01-01T00:00:00.000Z",
      }),
      profileData: generateProfileData({
        businessName: "Profile Business",
        responsibleOwnerName: "Profile Owner",
      }),
    });

    const userData = generateUserDataForBusiness(business, {
      user: generateUser({
        name: "User Contact",
        email: "user@email.com",
      }),
    });

    const result = getInitialData(userData, business);

    expect(result.businessName).toBe("Cigarette Business");
    expect(result.responsibleOwnerName).toBe("Cigarette Owner");
    expect(result.tradeName).toBe("Cigarette Trade");
    expect(result.taxId).toBe("cigarette-tax-123");
    expect(result.addressLine1).toBe("456 Cigarette St");
    expect(result.contactName).toBe("Cigarette Contact");
    expect(result.contactEmail).toBe("cigarette@email.com");
    expect(result.mailingAddressIsTheSame).toBe(true);
    expect(result.salesInfoSupplier).toEqual(["Supplier1", "Supplier2"]);
    expect(result.lastUpdatedISO).toBe("2023-01-01T00:00:00.000Z");
  });
});

describe("isAnyRequiredFieldEmpty", () => {
  const completeData = generateCigaretteLicenseData({
    businessName: "Test Business",
    responsibleOwnerName: "Test Owner",
    tradeName: "Test Trade",
    taxId: "123456789",
    addressLine1: "123 Test St",
    addressCity: "Test City",
    addressState: { name: "New Jersey", shortCode: "NJ" },
    addressZipCode: "07111",
    contactName: "Test Contact",
    contactPhoneNumber: "555-1234",
    contactEmail: "test@email.com",
    mailingAddressIsTheSame: true,
    salesInfoStartDate: "2023-01-01",
    salesInfoSupplier: ["Supplier1"],
    signature: true,
    signerRelationship: "Owner",
    signerName: "Test Signer",
  });

  it("should return false for step 0", () => {
    expect(isAnyRequiredFieldEmpty(generateCigaretteLicenseData({}), 0)).toBe(false);
    expect(isAnyRequiredFieldEmpty(completeData, 0)).toBe(false);
  });

  describe("Step 1 - Business Information", () => {
    it("should validate business name fields based on legal structure", () => {
      expect(
        isAnyRequiredFieldEmpty(
          { ...completeData, businessName: "" },
          1,
          "limited-liability-company",
        ),
      ).toBe(true);
      expect(isAnyRequiredFieldEmpty(completeData, 1, "limited-liability-company")).toBe(false);

      expect(
        isAnyRequiredFieldEmpty(
          { ...completeData, responsibleOwnerName: "", tradeName: "" },
          1,
          "sole-proprietorship",
        ),
      ).toBe(true);
      expect(isAnyRequiredFieldEmpty(completeData, 1, "sole-proprietorship")).toBe(false);
    });

    it("should validate mailing address fields conditionally", () => {
      expect(
        isAnyRequiredFieldEmpty(
          { ...completeData, mailingAddressIsTheSame: true, mailingAddressLine1: "" },
          1,
          "limited-liability-company",
        ),
      ).toBe(false);

      expect(
        isAnyRequiredFieldEmpty(
          { ...completeData, mailingAddressIsTheSame: false, mailingAddressLine1: "" },
          1,
          "limited-liability-company",
        ),
      ).toBe(true);
    });

    it("should require all common fields", () => {
      const requiredFields = [
        "taxId",
        "addressLine1",
        "addressCity",
        "addressZipCode",
        "contactName",
        "contactPhoneNumber",
        "contactEmail",
      ];

      for (const field of requiredFields) {
        const dataWithEmptyField = {
          ...completeData,
          [field]: field === "addressState" ? undefined : "",
        };
        expect(isAnyRequiredFieldEmpty(dataWithEmptyField, 1, "limited-liability-company")).toBe(
          true,
        );
      }

      expect(isAnyRequiredFieldEmpty(completeData, 1, "limited-liability-company")).toBe(false);
    });
  });

  describe("Step 2 - Sales Information", () => {
    it("should require sales fields", () => {
      expect(isAnyRequiredFieldEmpty({ ...completeData, salesInfoStartDate: "" }, 2)).toBe(true);
      expect(isAnyRequiredFieldEmpty({ ...completeData, salesInfoSupplier: undefined }, 2)).toBe(
        true,
      );
      expect(isAnyRequiredFieldEmpty(completeData, 2)).toBe(false);
    });
  });

  describe("Step 3 - Signature Information", () => {
    it("should require signature fields", () => {
      expect(isAnyRequiredFieldEmpty({ ...completeData, signature: false }, 3)).toBe(true);
      expect(isAnyRequiredFieldEmpty({ ...completeData, signerRelationship: "" }, 3)).toBe(true);
      expect(isAnyRequiredFieldEmpty({ ...completeData, signerName: "" }, 3)).toBe(true);
      expect(isAnyRequiredFieldEmpty(completeData, 3)).toBe(false);
    });
  });
});
