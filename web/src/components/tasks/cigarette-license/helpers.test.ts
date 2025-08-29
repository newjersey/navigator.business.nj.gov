import {
  getInitialData,
  shouldLockBusinessAddress,
} from "@/components/tasks/cigarette-license/helpers";
import {
  generateBusiness,
  generateFormationFormData,
  generateFormationData,
  generateUser,
  generateProfileData,
  generateCigaretteLicenseData,
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

describe("shouldLockBusinessAddress", () => {
  it("should return true when business has formed and has complete address data", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "Profile Business",
        responsibleOwnerName: "Profile Owner",
      }),
      formationData: generateFormationData({
        completedFilingPayment: true,
        formationFormData: generateFormationFormData({
          addressLine1: "Test Address",
          addressCity: "Test City",
          addressZipCode: "07111",
        }),
      }),
    });

    expect(shouldLockBusinessAddress(business)).toBe(true);
  });

  it("should return false when business has not formed", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "Profile Business",
        responsibleOwnerName: "Profile Owner",
      }),
      formationData: generateFormationData({
        completedFilingPayment: false,
        formationFormData: generateFormationFormData({
          addressLine1: "Test Address",
          addressCity: "Test City",
          addressZipCode: "07111",
        }),
      }),
    });

    expect(shouldLockBusinessAddress(business)).toBe(false);
  });

  it("should return false when address data is incomplete", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "Profile Business",
        responsibleOwnerName: "Profile Owner",
      }),
      formationData: generateFormationData({
        completedFilingPayment: false,
        formationFormData: generateFormationFormData({
          addressLine1: "Test Address",
          addressCity: "",
          addressMunicipality: undefined,
          addressZipCode: "07111",
        }),
      }),
    });

    expect(shouldLockBusinessAddress(business)).toBe(false);
  });

  it("should return false when business is undefined", () => {
    expect(shouldLockBusinessAddress(undefined)).toBe(false);
  });
});
