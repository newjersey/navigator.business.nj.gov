import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import { shouldLockBusinessAddress } from "@/lib/utils/taskHelpers";

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
