import { getMergedConfig } from "@/contexts/configContext";
import * as fetchMunicipality from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import * as roadmapBuilderModule from "@/lib/roadmap/roadmapBuilder";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateMunicipality,
  generateMunicipalityDetail,
  generateProfileData,
  generateRoadmap,
  generateTask,
} from "@/test/factories";
import { getLastCalledWith } from "@/test/helpers";
import { Industries } from "@businessnjgovnavigator/shared/";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";

jest.mock("@/lib/roadmap/roadmapBuilder", () => ({ buildRoadmap: jest.fn() }));
const mockRoadmapBuilder = (roadmapBuilderModule as jest.Mocked<typeof roadmapBuilderModule>).buildRoadmap;

jest.mock("@/lib/async-content-fetchers/fetchMunicipalityById", () => ({
  fetchMunicipalityById: jest.fn(),
}));
const mockFetchMunicipality = (fetchMunicipality as jest.Mocked<typeof fetchMunicipality>)
  .fetchMunicipalityById;

const Config = getMergedConfig();

const generateStartingProfile = (overrides: Partial<ProfileData>): ProfileData => {
  return generateProfileData({
    businessPersona: "STARTING",
    ...overrides,
  });
};

const createEmptyNexusProfile = (overrides: Partial<ProfileData>): ProfileData => {
  return {
    ...createEmptyProfileData(),
    businessPersona: "FOREIGN",
    foreignBusinessType: "NEXUS",
    ...overrides,
  };
};

describe("buildUserRoadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRoadmapBuilder.mockResolvedValue(generateRoadmap({}));
  });

  describe("foreign business", () => {
    it("adds roadmap for REMOTE_WORKER type", async () => {
      const profileData: ProfileData = {
        ...createEmptyProfileData(),
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_WORKER",
      };

      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toEqual(["foreign-remote-worker"]);
    });

    it("adds roadmap for REMOTE_SELLER type", async () => {
      const profileData: ProfileData = {
        ...createEmptyProfileData(),
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_SELLER",
      };

      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toEqual(["foreign-remote-seller"]);
    });

    it("adds roadmap for NEXUS type alongside industry tasks", async () => {
      const profileData = createEmptyNexusProfile({ industryId: "cannabis" });

      await buildUserRoadmap(profileData);
      const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
      expect(lastCalledWith.addOns).toContain("foreign-nexus");
      expect(lastCalledWith.industryId).toEqual("cannabis");
    });

    it("does not add legal structure add-ons for nexus", async () => {
      const baseProfileData = createEmptyNexusProfile({ industryId: "cannabis" });

      await buildUserRoadmap({ ...baseProfileData, legalStructureId: "limited-liability-company" });
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");

      await buildUserRoadmap({ ...baseProfileData, legalStructureId: "limited-partnership" });
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
    });

    it("adds trade-name add-ons for nexus legal structures", async () => {
      const baseProfileData = createEmptyNexusProfile({ industryId: "cannabis" });

      await buildUserRoadmap({ ...baseProfileData, legalStructureId: "general-partnership" });
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
    });

    it("removes register-for-ein task from roadmap for nexus", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [generateTask({ id: "register-for-ein" })],
        })
      );

      const profileData = createEmptyNexusProfile({ industryId: "cannabis" });
      const roadmap = await buildUserRoadmap(profileData);
      expect(roadmap.tasks).toHaveLength(0);
    });

    it("removes business-plan task from roadmap for nexus", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [generateTask({ id: "business-plan" })],
        })
      );

      const profileData = createEmptyNexusProfile({ industryId: "cannabis" });
      const roadmap = await buildUserRoadmap(profileData);
      expect(roadmap.tasks).toHaveLength(0);
    });

    it("adds scorp-ccorp-foreign for S-Corp/C-Corp legal structures", async () => {
      await buildUserRoadmap(createEmptyNexusProfile({ legalStructureId: "s-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("scorp-ccorp-foreign");

      await buildUserRoadmap(createEmptyNexusProfile({ legalStructureId: "c-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("scorp-ccorp-foreign");
    });

    it("adds public-record-filing-foreign for Public Record Filing legal structures", async () => {
      const profileData = createEmptyNexusProfile({ legalStructureId: "limited-liability-company" });
      await buildUserRoadmap(profileData);
      const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
      expect(lastCalledWith.addOns).toContain("public-record-filing-foreign");
    });

    it("adds DBA add-on if user profile DBA name is not undefined", async () => {
      const profileData = createEmptyNexusProfile({ nexusDbaName: "" });
      await buildUserRoadmap(profileData);
      const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
      expect(lastCalledWith.addOns).toContain("foreign-nexus-dba-name");
    });

    it("does not add DBA add-on if user profile DBA name is undefined", async () => {
      const profileData = createEmptyNexusProfile({ nexusDbaName: undefined });
      await buildUserRoadmap(profileData);
      const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
      expect(lastCalledWith.addOns).not.toContain("foreign-nexus-dba-name");
    });
  });

  describe("home-based business", () => {
    it("adds permanent-location-business add-on if home-based business is false", async () => {
      await buildUserRoadmap(generateStartingProfile({ industryId: "generic", homeBasedBusiness: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("permanent-location-business");
    });

    it("does not add permanent-location-business add-on if home-based business is true", async () => {
      await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
    });

    it("does not add permanent-location-business add-on if industry does not allow permanent location", async () => {
      await buildUserRoadmap(generateStartingProfile({ industryId: "food-truck" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
    });

    it("does NOT add permanent-location-business add-on if nexusLocationInNewJersey is false", async () => {
      const profileData = createEmptyNexusProfile({
        industryId: "generic",
        homeBasedBusiness: false,
        nexusLocationInNewJersey: false,
      });
      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
    });

    it("does NOT add permanent-location-business add-on if homeBasedBusiness: false and nexusLocationInNewJersey: false", async () => {
      const profileData = createEmptyNexusProfile({
        industryId: "generic",
        homeBasedBusiness: false,
        nexusLocationInNewJersey: false,
      });
      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
    });

    it("adds permanent-location-business add-on if homeBasedBusiness: false and nexusLocationInNewJersey: undefined", async () => {
      const profileData = createEmptyNexusProfile({
        industryId: "generic",
        homeBasedBusiness: false,
        nexusLocationInNewJersey: undefined,
      });
      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("permanent-location-business");
    });

    it("adds permanent-location-business add-on if homeBasedBusiness: false and nexusLocationInNewJersey: true", async () => {
      const profileData = createEmptyNexusProfile({
        industryId: "generic",
        homeBasedBusiness: false,
        nexusLocationInNewJersey: true,
      });
      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("permanent-location-business");
    });
  });

  describe("reseller tasks", () => {
    it("adds reseller task if canBeReseller is true", async () => {
      await buildUserRoadmap(generateStartingProfile({ industryId: "food-truck" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("reseller");
    });

    it("does not add reseller task if canBeReseller is false", async () => {
      await buildUserRoadmap(generateStartingProfile({ industryId: "non-medical-transport" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("reseller");
    });
  });

  describe("legal structure", () => {
    describe("formation tasks", () => {
      it("adds formation for llc legal type", async () => {
        await buildUserRoadmap(generateStartingProfile({ legalStructureId: "limited-liability-company" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
      });

      describe("feature flaged structures", () => {
        it("adds formation for llp legal type when enabled", async () => {
          await buildUserRoadmap(
            generateStartingProfile({ legalStructureId: "limited-liability-partnership" })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
        });

        it("adds formation for lp legal type when enabled", async () => {
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "limited-partnership" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
        });

        it("adds formation for ccorp legal type when enabled", async () => {
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "c-corporation" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
        });

        it("adds formation for scorp legal type when enabled", async () => {
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "s-corporation" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
        });

        it("does not add formation for llp legal type when feature flag is disabled", async () => {
          process.env.FEATURE_BUSINESS_LLP = "false";
          await buildUserRoadmap(
            generateStartingProfile({ legalStructureId: "limited-liability-partnership" })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
          process.env.FEATURE_BUSINESS_LLP = "true";
        });

        it("does not add formation for lp legal type when feature flag is disabled", async () => {
          process.env.FEATURE_BUSINESS_LP = "false";
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "limited-partnership" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
          process.env.FEATURE_BUSINESS_LP = "true";
        });

        it("does notadd formation for ccorp legal type when feature flag is disabled", async () => {
          process.env.FEATURE_BUSINESS_CCORP = "false";
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "c-corporation" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
          process.env.FEATURE_BUSINESS_CCORP = "true";
        });

        it("does not add formation for scorp legal type when feature flag is disabled", async () => {
          process.env.FEATURE_BUSINESS_SCORP = "false";
          await buildUserRoadmap(generateStartingProfile({ legalStructureId: "s-corporation" }));
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
          process.env.FEATURE_BUSINESS_SCORP = "true";
        });
      });
    });

    it("adds trade-name for general partnership legal structure", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
    });

    it("adds trade-name for sole proprietorship legal structure", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "sole-proprietorship" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
    });

    it("adds tax registration tasks for S-Corp legal structures", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("scorp");

      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "s-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("scorp");
    });
  });

  describe("industry", () => {
    for (const industry of Industries.filter((x) => x.id !== "generic")) {
      it(`adds ${industry.name} industry and modifications`, async () => {
        await buildUserRoadmap(
          generateStartingProfile({ industryId: industry.id, certifiedInteriorDesigner: true })
        );
        const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
        const shouldNotContainIndustries = Industries.filter((it) => it.id !== industry.id);
        expect(lastCalledWith.industryId).toBe(industry.id);
        for (const shouldNotContainIndustry of shouldNotContainIndustries) {
          expect(lastCalledWith.addOns).not.toContain(shouldNotContainIndustry);
        }
      });
    }

    describe("on-boarding modifications", () => {
      describe("staffing service", () => {
        for (const industry of Industries.filter(
          (x) => x.industryOnboardingQuestions.isProvidesStaffingServicesApplicable
        )) {
          it(`set industry to employment-agency if ${industry.name} with staffing service`, async () => {
            const profileData: ProfileData = {
              ...createEmptyProfileData(),
              industryId: industry.id,
              providesStaffingService: true,
            };

            await buildUserRoadmap(profileData);
            const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
            expect(lastCalledWith.industryId).toEqual("employment-agency");
          });

          it(`keeps industry as ${industry.name} if no staffing service provided`, async () => {
            const profileData: ProfileData = {
              ...createEmptyProfileData(),
              industryId: industry.id,
              providesStaffingService: false,
            };

            await buildUserRoadmap(profileData);
            const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
            expect(lastCalledWith.industryId).toEqual(industry.id);
          });
        }
      });

      describe("interior designer - certified", () => {
        it("set industry to generic if a non certified interor designer", async () => {
          const profileData: ProfileData = {
            ...createEmptyProfileData(),
            industryId: "interior-designer",
            certifiedInteriorDesigner: false,
          };

          await buildUserRoadmap(profileData);
          const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
          expect(lastCalledWith.industryId).toEqual("generic");
        });

        it("keeps industry as interior-designer if a certified interor designer", async () => {
          const profileData: ProfileData = {
            ...createEmptyProfileData(),
            industryId: "interior-designer",
            certifiedInteriorDesigner: true,
          };

          await buildUserRoadmap(profileData);
          const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
          expect(lastCalledWith.industryId).toEqual("interior-designer");
        });
      });

      describe("real estate appraiser", () => {
        it("adds real estate appraisal management add-on and modification if is true and industry is real-estate-appraisals", async () => {
          await buildUserRoadmap(
            generateStartingProfile({
              realEstateAppraisalManagement: true,
              industryId: "real-estate-appraisals",
            })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain(
            "real-estate-appraisal-management"
          );
        });

        it("adds real estate appraiser add-on and modification if is false and industry is real-estate-appraisals", async () => {
          await buildUserRoadmap(
            generateStartingProfile({
              realEstateAppraisalManagement: false,
              industryId: "real-estate-appraisals",
            })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("real-estate-appraiser");
        });

        it("does not add either real estate add-on and modification if is false and industry is not real-estate-appraisals", async () => {
          await buildUserRoadmap(
            generateStartingProfile({ realEstateAppraisalManagement: false, industryId: "generic" })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("real-estate-appraiser");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
            "real-estate-appraisal-management"
          );
        });

        it("does not add either real estate add-on and modification if is true and industry is not real-estate-appraisals", async () => {
          await buildUserRoadmap(
            generateStartingProfile({ realEstateAppraisalManagement: true, industryId: "generic" })
          );
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("real-estate-appraiser");
          expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
            "real-estate-appraisal-management"
          );
        });
      });
    });

    describe("cpa", () => {
      it("adds cpa add-on and modification if is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ requiresCpa: true }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cpa");
      });

      it("does not add liquor-license add-on and modification if is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ requiresCpa: false }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cpa");
      });
    });

    describe("transportation", () => {
      it("adds home-based-transporation add-on if transportation and home-based", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: true, industryId: "trucking" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("home-based-transporation");
      });

      it("does not add home-based-transporation add-on if transportation and not home-based", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: false, industryId: "trucking" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("home-based-transporation");
      });

      it("does not add home-based-transporation add-on if not transportation", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: true, industryId: "generic" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("home-based-transporation");
      });
    });

    describe("liquor license", () => {
      it("adds liquor-license add-on and modification if is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ liquorLicense: true }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("liquor-license");
      });

      it("does not add liquor-license add-on and modification if is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ liquorLicense: false }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("liquor-license");
      });
    });

    describe("cannabis license type", () => {
      it("adds annual-cannabis add-on when cannabis license ANNUAL", async () => {
        await buildUserRoadmap(generateStartingProfile({ cannabisLicenseType: "ANNUAL" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cannabis-annual");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-conditional");
      });

      it("adds conditional-cannabis add-on when cannabis license CONDITIONAL", async () => {
        await buildUserRoadmap(generateStartingProfile({ cannabisLicenseType: "CONDITIONAL" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-annual");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cannabis-conditional");
      });

      it("adds neither cannabis add-on when cannabis license is undefined", async () => {
        await buildUserRoadmap(generateStartingProfile({ cannabisLicenseType: undefined }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-annual");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-conditional");
      });
    });
  });

  describe("municipality", () => {
    it("replaces placeholders with info from the user municipality", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({
          id: "1234",
          townWebsite: "www.cooltown.com",
          townName: "Cool Town",
          townDisplayName: "Cool Town (NJ)",
          countyClerkWebsite: "www.cooltownclerk.com",
          countyClerkPhone: "123-456-7890",
        })
      );

      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [
            generateTask({
              callToActionLink: "${municipalityWebsite}",
              callToActionText: "Visit the ${municipality} Website",
              stepNumber: 1,
              contentMd:
                "You can find your city or town clerk through either " +
                "the [${municipality} website](${municipalityWebsite}) or by contacting " +
                "your [county clerk](${countyClerkWebsite}) at ${countyClerkPhone}.",
            }),
          ],
        })
      );

      const onboardingData = generateStartingProfile({ municipality: generateMunicipality({ id: "1234" }) });
      const roadmap = await buildUserRoadmap(onboardingData);

      const municipalityTask = roadmap.tasks[0];
      expect(municipalityTask.callToActionLink).toEqual("www.cooltown.com");
      expect(municipalityTask.callToActionText).toEqual("Visit the Cool Town Website");
      expect(municipalityTask.contentMd).toEqual(
        "You can find your city or town clerk through either " +
          "the [Cool Town website](www.cooltown.com) or by contacting " +
          "your [county clerk](www.cooltownclerk.com) at 123-456-7890."
      );
    });

    it("replaces placeholders with empty text if user has no municipality", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [
            generateTask({
              callToActionLink: "${municipalityWebsite}",
              callToActionText: "Visit the ${municipality} Website",
              contentMd:
                "You can find your city or town clerk through either " +
                "the [${municipality} website](${municipalityWebsite}) or by contacting " +
                "your [county clerk](${countyClerkWebsite}) at ${countyClerkPhone}.",
            }),
          ],
        })
      );

      const onboardingData = generateStartingProfile({ municipality: undefined });
      const roadmap = await buildUserRoadmap(onboardingData);

      const municipalityTask = roadmap.tasks[0];
      expect(municipalityTask.callToActionLink).toEqual("");
      expect(municipalityTask.callToActionText).toEqual("Visit the  Website");
      expect(municipalityTask.contentMd).toEqual(
        "You can find your city or town clerk through either " +
          "the [ website]() or by contacting " +
          "your [county clerk]() at ."
      );
    });
  });

  describe("NAICS code", () => {
    it("replaces placeholder with user NAICS code", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [generateTask({ contentMd: "NAICS code ${naicsCode}" })],
        })
      );

      const profileData = generateStartingProfile({ naicsCode: "621399" });
      const roadmap = await buildUserRoadmap(profileData);

      const task = roadmap.tasks[0];
      const expectedTemplate = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
        naicsCode: "621399 - Offices of All Other Miscellaneous Health Practitioners",
      });
      expect(task.contentMd).toEqual(`NAICS code ${expectedTemplate}`);
    });

    it("replaces tasks with NAICS code and tasks with municipality", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({ id: "1234", townName: "Cool Town" })
      );

      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [
            generateTask({ contentMd: "NAICS code ${naicsCode}" }),
            generateTask({ contentMd: "Visit the ${municipality} Website" }),
          ],
        })
      );

      const profileData = generateStartingProfile({
        naicsCode: "123456",
        municipality: generateMunicipality({ id: "1234" }),
      });
      const roadmap = await buildUserRoadmap(profileData);

      const naicsTask = roadmap.tasks[0];
      const municipalityTask = roadmap.tasks[1];
      const expectedTemplate = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
        naicsCode: "123456 - Unknown Code",
      });
      expect(naicsTask.contentMd).toEqual(`NAICS code ${expectedTemplate}`);
      expect(municipalityTask.contentMd).toEqual("Visit the Cool Town Website");
    });

    it("replaces placeholder with empty text if user has no NAICS code", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          tasks: [generateTask({ contentMd: "NAICS code ${naicsCode}" })],
        })
      );

      const profileData = generateStartingProfile({ naicsCode: "" });
      const roadmap = await buildUserRoadmap(profileData);

      const task = roadmap.tasks[0];
      expect(task.contentMd).toEqual(
        `NAICS code ${Config.determineNaicsCode.registerForTaxesMissingNAICSCodePlaceholder}`
      );
    });
  });
});
