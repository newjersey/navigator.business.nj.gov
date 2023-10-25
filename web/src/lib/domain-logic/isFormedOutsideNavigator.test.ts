import { isFormedOutsideNavigator } from "@/lib/domain-logic/isFormedOutsideNavigator";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";

const nonOwningPersonas: BusinessPersona[] = ["STARTING", "FOREIGN"];

describe("isFormedOutsideNavigator", () => {
  it("returns false if business is not defined", () => {
    expect(isFormedOutsideNavigator(undefined)).toBe(false);
  });

  it("returns true if persona is OWNING", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "OWNING",
      }),
    });
    expect(isFormedOutsideNavigator(business)).toBe(true);
  });

  it.each(nonOwningPersonas)(
    "returns true if completedFilingPayment is false and dateOfFormation is defined for %s persona",
    (persona) => {
      const business = generateBusiness({
        formationData: generateFormationData({
          completedFilingPayment: false,
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-8-8",
          businessPersona: persona as BusinessPersona,
        }),
      });
      expect(isFormedOutsideNavigator(business)).toBe(true);
    }
  );

  it.each(nonOwningPersonas)("returns false if completedFilingPayment is true for %s persona", (persona) => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: true,
      }),
      profileData: generateProfileData({
        dateOfFormation: "2020-8-8",
        businessPersona: persona as BusinessPersona,
      }),
    });
    expect(isFormedOutsideNavigator(business)).toBe(false);
  });

  it.each(nonOwningPersonas)("returns false if dateOfFormation is undefined for %s persona", (persona) => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: false,
      }),
      profileData: generateProfileData({
        dateOfFormation: undefined,
        businessPersona: persona as BusinessPersona,
      }),
    });
    expect(isFormedOutsideNavigator(business)).toBe(false);
  });
});
