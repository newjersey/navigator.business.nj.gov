import { getMergedConfig } from "@/contexts/configContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import {
  BusinessPersona,
  ForeignBusinessTypeId,
  generateBusiness,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { generateOwningProfileData } from "@businessnjgovnavigator/shared/";
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
  describe("when not authenticated", () => {
    it("shows Guest text", () => {
      const navBarBusinessTitle = getNavBarBusinessTitle(generateBusiness({}), false);
      expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestBusinessText);
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
            legalStructureId: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows business name", () => {
          const business = generateBusiness({
            profileData: generateOwningProfileData({
              ...publicFilingProfile(),
              businessName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });

      describe("OWNING", () => {
        it("shows trade name", () => {
          const business = generateBusiness({
            profileData: generateOwningProfileData({
              ...tradeNameProfile(),
              tradeName: name,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
          expect(navBarBusinessTitle).toEqual(name);
        });
      });
    });

    describe("Nexus DBA", () => {
      it("shows unnamed dba when the nexusDbaName is empty and needsNexusDbaName is true", () => {
        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
            businessName: "test business Name",
            needsNexusDbaName: true,
            nexusDbaName: "",
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
        expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedDbaBusinessText);
      });

      it("shows the dba name when the user has entered a DBA name", () => {
        const dbaName = "dbaName";

        const business = generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
            businessName: "test business Name",
            needsNexusDbaName: true,
            nexusDbaName: dbaName,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
        expect(navBarBusinessTitle).toEqual(dbaName);
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
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
            profileData: generateOwningProfileData({
              ...publicFilingProfile(),
              businessName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
            profileData: generateOwningProfileData({
              ...tradeNameProfile(),
              tradeName: undefined,
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
            businessName: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
            businessName: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
        expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
      });
    });

    describe("OWNING", () => {
      it("shows Unnamed Business", () => {
        const business = generateBusiness({
          onboardingFormProgress: "COMPLETED",
          profileData: generateOwningProfileData({
            legalStructureId: undefined,
            tradeName: undefined,
            businessName: undefined,
          }),
        });
        const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
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
          industryId: undefined,
        }),
      });
      const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
      expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarUnnamedOwnedBusinessText);
    });

    describe("FOREIGN", () => {
      it.each(["employeesInNJ", "revenueInNJ", "transactionsInNJ"])(
        "shows Unnamed Out-of-State Business when FOREIGN and %s",
        (foreignBusinessTypeId) => {
          const business = generateBusiness({
            profileData: generateProfileData({
              legalStructureId: undefined,
              businessName: undefined,
              tradeName: undefined,
              businessPersona: "FOREIGN",
              foreignBusinessTypeIds: [foreignBusinessTypeId] as ForeignBusinessTypeId[],
            }),
          });
          const navBarBusinessTitle = getNavBarBusinessTitle(business, true);
          expect(navBarBusinessTitle).toEqual(
            Config.navigationDefaults.navBarUnnamedForeignRemoteSellerWorkerText
          );
        }
      );
    });
  });
});
