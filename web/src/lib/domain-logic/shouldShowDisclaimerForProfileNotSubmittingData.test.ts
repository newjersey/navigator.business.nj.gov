import { shouldShowDisclaimerForProfileNotSubmittingData } from "@/lib/domain-logic/shouldShowDisclaimerForProfileNotSubmittingData";
import { BusinessPersona, businessPersonas } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";

import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";

const nonOwningPersonas: BusinessPersona[] = ["STARTING", "FOREIGN"];

describe("shouldShowDisclaimerForProfileNotSubmittingData", () => {
  it("returns true if business is not defined", () => {
    expect(shouldShowDisclaimerForProfileNotSubmittingData(undefined, IsAuthenticated.TRUE)).toBe(true);
    expect(shouldShowDisclaimerForProfileNotSubmittingData(undefined, IsAuthenticated.FALSE)).toBe(true);
  });

  it("returns true if isAuthenticated is UNKNOWN", () => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: false,
      }),
      profileData: generateProfileData({
        dateOfFormation: undefined,
        businessPersona: "STARTING",
      }),
    });
    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.UNKNOWN)).toBe(true);
    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.UNKNOWN)).toBe(true);
  });

  it("returns true if persona is OWNING and Authenticated", () => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: false,
      }),
      profileData: generateProfileData({
        businessPersona: "OWNING",
        dateOfFormation: undefined,
      }),
    });
    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(true);
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
      expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(true);
    }
  );

  it("returns true for REMOTE_WORKER", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeesInNJ"],
        dateOfFormation: undefined,
      }),
    });

    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(true);
  });

  it("returns true for REMOTE_SELLER", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["revenueInNJ", "transactionsInNJ"],
        dateOfFormation: undefined,
      }),
    });

    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(true);
  });

  it.each(nonOwningPersonas)(
    "returns false if completedFilingPayment is true for %s persona and is not owning or authenticated",
    (persona) => {
      const business = generateBusiness({
        formationData: generateFormationData({
          completedFilingPayment: true,
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-8-8",
          businessPersona: persona as BusinessPersona,
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        }),
      });
      expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(false);
    }
  );

  it.each(nonOwningPersonas)("returns false if dateOfFormation is undefined for %s persona", (persona) => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: false,
      }),
      profileData: generateProfileData({
        dateOfFormation: undefined,
        businessPersona: persona as BusinessPersona,
        operatingPhase: OperatingPhaseId.FORMED,
      }),
    });
    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.TRUE)).toBe(false);
  });

  it.each(businessPersonas)("returns true for a %s persona in who is not authenticated", (persona) => {
    const business = generateBusiness({
      formationData: generateFormationData({
        completedFilingPayment: false,
      }),
      profileData: generateProfileData({
        dateOfFormation: undefined,
        businessPersona: persona as BusinessPersona,
      }),
    });
    expect(shouldShowDisclaimerForProfileNotSubmittingData(business, IsAuthenticated.FALSE)).toBe(true);
  });
});
