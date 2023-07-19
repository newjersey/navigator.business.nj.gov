import { getMergedConfig } from "@/contexts/configContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import {
  BusinessPersona,
  generateBusiness,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig();

const name = "some cool name";

const publicFilingProfile = (): Partial<ProfileData> => {
  return {
    tradeName: "",
    legalStructureId: "limited-liability-company",
  };
};

const tradeNameProfile = (): Partial<ProfileData> => {
  return {
    businessName: "",
    legalStructureId: "sole-proprietorship",
  };
};

describe("getNavBarBusinessTitle", () => {
  describe("when name is defined", () => {
    describe("when legal structure undefined", () => {
      it.each(["STARTING", "OWNING"])("shows business name", (businessPersona) => {
        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            businessName: name,
            tradeName: "",
            legalStructureId: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business);
        expect(navBarBusinessTitle).toEqual(name);
      });

      it.each(["STARTING", "OWNING"])("shows business name", (businessPersona) => {
        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            businessName: "",
            tradeName: name,
            legalStructureId: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business);
        expect(navBarBusinessTitle).toEqual(name);
      });

      it.each(["STARTING", "OWNING"])(
        "shows business name over trade name if both defined",
        (businessPersona) => {
          const business = generateBusiness({
            profileData: generateProfileData({
              businessPersona: businessPersona as BusinessPersona,
              businessName: name,
              tradeName: "some trade name",
              legalStructureId: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(name);
        }
      );
    });

    describe("Public Filing", () => {
      describe("STARTING", () => {
        it("shows business name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "STARTING",
              businessName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows business name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "OWNING",
              businessName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });
    });

    describe("Trade Name", () => {
      describe("STARTING", () => {
        it("shows trade name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...tradeNameProfile(),
              businessPersona: "STARTING",
              tradeName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows trade name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...tradeNameProfile(),
              businessPersona: "OWNING",
              tradeName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });
    });
  });

  describe("when name undefined, legal structure defined, and industry defined", () => {
    describe("Public Filing", () => {
      describe("STARTING", () => {
        it("shows Unnamed [Industry] [Legal Structure]", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "STARTING",
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
              LookupIndustryById(business?.profileData?.industryId).name
            } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`
          );
        });
      });

      describe("OWNING", () => {
        it("shows Unnamed Business [Legal Structure]", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "OWNING",
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
              LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
            }`
          );
        });
      });
    });

    describe("Trade Name", () => {
      describe("STARTING", () => {
        it("shows Unnamed [Industry] [Legal Structure]", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...tradeNameProfile(),
              businessPersona: "STARTING",
              tradeName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
              LookupIndustryById(business?.profileData?.industryId).name
            } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`
          );
        });
      });

      describe("OWNING", () => {
        it("shows Unnamed Business [Legal Structure]", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...tradeNameProfile(),
              businessPersona: "OWNING",
              tradeName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
              LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
            }`
          );
        });
      });
    });
  });

  describe("when name undefined, legal structure undefined, and industry defined", () => {
    describe("when completed onboarding", () => {
      describe("STARTING", () => {
        it("shows Unnamed [Industry]", () => {
          const business = generateBusiness({
            onboardingFormProgress: "COMPLETED",
            profileData: generateProfileData({
              businessPersona: "STARTING",
              legalStructureId: undefined,
              tradeName: undefined,
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
              LookupIndustryById(business?.profileData?.industryId).name
            }`
          );
        });
      });

      describe("OWNING", () => {
        it("shows Unnamed Business", () => {
          const business = generateBusiness({
            onboardingFormProgress: "COMPLETED",
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: undefined,
              tradeName: undefined,
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
        });
      });
    });

    describe("when NOT completed onboarding", () => {
      it.each(["STARTING", "OWNING"])("shows Guest", (persona) => {
        const business = generateBusiness({
          onboardingFormProgress: "UNSTARTED",
          profileData: generateProfileData({
            businessPersona: persona as BusinessPersona,
            legalStructureId: undefined,
            tradeName: undefined,
            businessName: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business);
        expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
      });
    });
  });

  describe("when legal structure, industry, name undefined", () => {
    describe("when completed onboarding", () => {
      describe("STARTING", () => {
        it("shows guest text", () => {
          const business = generateBusiness({
            onboardingFormProgress: "COMPLETED",
            profileData: generateProfileData({
              businessPersona: "STARTING",
              legalStructureId: undefined,
              industryId: undefined,
              tradeName: undefined,
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
        });
      });

      describe("OWNING", () => {
        it("shows Unnamed Business text", () => {
          const business = generateBusiness({
            onboardingFormProgress: "COMPLETED",
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: undefined,
              industryId: undefined,
              tradeName: undefined,
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business);
          expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
        });
      });

      describe("when not completed onboarding", () => {
        describe("STARTING", () => {
          it("shows guest text", () => {
            const business = generateBusiness({
              onboardingFormProgress: "UNSTARTED",
              profileData: generateProfileData({
                businessPersona: "STARTING",
                legalStructureId: undefined,
                industryId: undefined,
                tradeName: undefined,
                businessName: undefined,
              }),
            });
            const navBarBusinessTitle = getNavBarBusinessTitle(business);
            expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
          });
        });

        describe("OWNING", () => {
          it("shows guest text", () => {
            const business = generateBusiness({
              onboardingFormProgress: "UNSTARTED",
              profileData: generateProfileData({
                businessPersona: "STARTING",
                legalStructureId: undefined,
                industryId: undefined,
                tradeName: undefined,
                businessName: undefined,
              }),
            });
            const navBarBusinessTitle = getNavBarBusinessTitle(business);
            expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
          });
        });
      });
    });
  });
});
