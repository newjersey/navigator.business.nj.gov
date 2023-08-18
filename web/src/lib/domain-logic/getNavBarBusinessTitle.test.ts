import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import {
  BusinessPersona,
  ForeignBusinessType,
  generateBusiness,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData
} from "@businessnjgovnavigator/shared";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig();

const name = "some cool name";

const publicFilingProfile = (): Partial<ProfileData> => {
  return {
    tradeName: "",
    legalStructureId: "limited-liability-company"
  };
};

const tradeNameProfile = (): Partial<ProfileData> => {
  return {
    businessName: "",
    legalStructureId: "sole-proprietorship"
  };
};

describe("getNavBarBusinessTitle", () => {
  describe("when not authenticated", () => {
    it("shows Guest text", () => {
      const navBarBusinessTitle = getNavBarBusinessTitle(generateBusiness({}), IsAuthenticated.FALSE);
      expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
    });
  });

  describe("when name is defined", () => {
    describe("when legal structure undefined", () => {
      it.each(["STARTING", "OWNING"])("shows business name", (businessPersona) => {
        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            businessName: name,
            tradeName: "",
            legalStructureId: undefined
          })
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
        expect(navBarBusinessTitle).toEqual(name);
      });

      it.each(["STARTING", "OWNING"])("shows business name", (businessPersona) => {
        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: businessPersona as BusinessPersona,
            businessName: "",
            tradeName: name,
            legalStructureId: undefined
          })
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
              legalStructureId: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
              businessName: name
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows business name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "OWNING",
              businessName: name
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
              tradeName: name
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows trade name", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...tradeNameProfile(),
              businessPersona: "OWNING",
              tradeName: name
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });
    });
  });

  describe("when name undefined, legal structure defined, and industry defined", () => {
    describe("Public Filing", () => {
      describe("STARTING", () => {
        it("shows Unnamed [Industry] [Legal Structure] when non-generic industry", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              industryId: "cannabis",
              businessPersona: "STARTING",
              businessName: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
              LookupIndustryById(business?.profileData?.industryId).name
            } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`
          );
        });

        it("shows Unnamed Business [Legal Structure] when generic industry", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              industryId: "generic",
              businessPersona: "STARTING",
              businessName: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(
            `${Config.navigationDefaults.navBarUnnamedOwnedBusinessText} ${
              LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation
            }`
          );
        });
      });

      describe("OWNING", () => {
        it("shows Unnamed Business [Legal Structure]", () => {
          const business = generateBusiness({
            profileData: generateProfileData({
              ...publicFilingProfile(),
              businessPersona: "OWNING",
              businessName: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
              tradeName: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
              tradeName: undefined
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
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
    describe("STARTING", () => {
      it("shows Unnamed [Industry] when non-generic industry", () => {
        const business = generateBusiness({
          onboardingFormProgress: "COMPLETED",
          profileData: generateProfileData({
            businessPersona: "STARTING",
            industryId: "home-contractor",
            legalStructureId: undefined,
            tradeName: undefined,
            businessName: undefined
          })
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
        expect(navBarBusinessTitle).toEqual(
          `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
            LookupIndustryById(business?.profileData?.industryId).name
          }`
        );
      });

      it("shows Unnamed Business when generic industry", () => {
        const business = generateBusiness({
          onboardingFormProgress: "COMPLETED",
          profileData: generateProfileData({
            businessPersona: "STARTING",
            industryId: "generic",
            legalStructureId: undefined,
            tradeName: undefined,
            businessName: undefined
          })
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
        expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
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
            businessName: undefined
          })
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
        expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
      });
    });
  });

  describe("when legal structure, industry, and name undefined", () => {
    it.each(["STARTING", "OWNING"])("shows Unnamed Business", (persona) => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: persona as BusinessPersona,
          legalStructureId: undefined,
          tradeName: undefined,
          businessName: undefined,
          industryId: undefined
        })
      });
      const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
      expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
    });

    describe("FOREIGN", () => {
      it.each(["REMOTE_SELLER", "REMOTE_WORKER"])(
        "shows Unnamed Out-of-State Business when FOREIGN and %s",
        (foreignBusinessType) => {
          const business = generateBusiness({
            profileData: generateProfileData({
              legalStructureId: undefined,
              businessName: undefined,
              tradeName: undefined,
              businessPersona: "FOREIGN",
              foreignBusinessType: foreignBusinessType as ForeignBusinessType
            })
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, IsAuthenticated.TRUE);
          expect(navBarBusinessTitle).toEqual(
            Config.navigationDefaults.navBarUnnamedForeignRemoteSellerWorkerText
          );
        }
      );
    });
  });
});
