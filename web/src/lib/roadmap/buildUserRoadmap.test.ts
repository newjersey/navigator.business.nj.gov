import { getMergedConfig } from "@/contexts/configContext";
import * as getNonEssentialAddOnModule from "@/lib/domain-logic/getNonEssentialQuestionAddOn";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import * as roadmapBuilderModule from "@/lib/roadmap/roadmapBuilder";
import { generateRoadmap, generateTask } from "@/test/factories";
import { getLastCalledWith } from "@/test/helpers/helpers-utilities";
import {
  Industries,
  generateMunicipality,
  generateMunicipalityDetail,
  generateProfileData,
} from "@businessnjgovnavigator/shared";
import * as fetchMunicipalityById from "@businessnjgovnavigator/shared/domain-logic/fetchMunicipalityById";
import {
  ProfileData,
  createEmptyProfileData,
  emptyIndustrySpecificData,
} from "@businessnjgovnavigator/shared/profileData";

jest.mock("@/lib/domain-logic/getNonEssentialQuestionAddOn", () => ({
  getNonEssentialQuestionAddOn: jest.fn(),
}));

const mockGetNonEssentialQuestionAddOn = (
  getNonEssentialAddOnModule as jest.Mocked<typeof getNonEssentialAddOnModule>
).getNonEssentialQuestionAddOn;

jest.mock("../../../../shared/lib/content/lib/industry.json", () => ({
  industries: [
    ...jest.requireActual("../../../../shared/lib/content/lib/industry.json").industries,
    {
      id: "non-essential-question-industry",
      name: "Non Essential Question Industry",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: ["non-essential-question-1", "non-essential-question-2"],
      naicsCodes: "",
      isEnabled: true,
      industryOnboardingQuestions: {},
    },
  ],
}));

jest.mock("@/lib/roadmap/roadmapBuilder", () => ({ buildRoadmap: jest.fn() }));
jest.mock("@businessnjgovnavigator/shared/domain-logic/fetchMunicipalityById", () => ({
  fetchMunicipalityById: jest.fn(),
}));

const mockRoadmapBuilder = (roadmapBuilderModule as jest.Mocked<typeof roadmapBuilderModule>).buildRoadmap;
const mockFetchMunicipality = (fetchMunicipalityById as jest.Mocked<typeof fetchMunicipalityById>)
  .fetchMunicipalityById;
const Config = getMergedConfig();

const generateStartingProfile = (overrides: Partial<ProfileData>): ProfileData => {
  return generateProfileData({
    businessPersona: "STARTING",
    ...emptyIndustrySpecificData,
    ...overrides,
  });
};

const createEmptyNexusProfile = (overrides: Partial<ProfileData>): ProfileData => {
  return {
    ...createEmptyProfileData(),
    businessPersona: "FOREIGN",
    foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
    ...emptyIndustrySpecificData,
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
        foreignBusinessTypeIds: ["employeesInNJ"],
      };

      await buildUserRoadmap(profileData);
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toEqual(["foreign-remote-worker"]);
    });

    it("adds roadmap for REMOTE_SELLER type", async () => {
      const profileData: ProfileData = {
        ...createEmptyProfileData(),
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["revenueInNJ"],
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

    it("adds public-record-filing-foreign add-ons for nexus public filing legal structures", async () => {
      const baseProfileData = createEmptyNexusProfile({ industryId: "cannabis" });

      await buildUserRoadmap({ ...baseProfileData, legalStructureId: "limited-liability-company" });
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing-foreign");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
    });

    it("adds trade-name add-ons for nexus trade name legal structures", async () => {
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
  });

  describe("home-based business", () => {
    describe("starting", () => {
      it("adds permanent-location-business add-on if home-based business is false", async () => {
        await buildUserRoadmap(generateStartingProfile({ industryId: "generic", homeBasedBusiness: false }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("permanent-location-business");
      });

      it("does not add permanent-location-business add-on if home-based business is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ industryId: "generic", homeBasedBusiness: true }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
      });

      it("does not add permanent-location-business add-on if home-based business is undefined", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ industryId: "generic", homeBasedBusiness: undefined })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
      });

      it("does not add permanent-location-business add-on if industry does not allow permanent location", async () => {
        await buildUserRoadmap(generateStartingProfile({ industryId: "food-truck" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
      });
    });

    describe("nexus", () => {
      it("does NOT add permanent-location-business add-on if foreignBusinessTypeIds doesn't contain officeInNJ", async () => {
        const profileData = createEmptyNexusProfile({
          industryId: "generic",
          homeBasedBusiness: false,
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        });
        await buildUserRoadmap(profileData);
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
      });

      it("does NOT add permanent-location-business add-on if homeBasedBusiness is false and foreignBusinessTypeIds doesn't contain officeInNJ", async () => {
        const profileData = createEmptyNexusProfile({
          industryId: "generic",
          homeBasedBusiness: false,
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        });
        await buildUserRoadmap(profileData);
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("permanent-location-business");
      });

      it("adds permanent-location-business add-on if homeBasedBusiness is false and foreignBusinessTypeIds contains officeInNJ", async () => {
        const profileData = createEmptyNexusProfile({
          industryId: "generic",
          homeBasedBusiness: false,
          foreignBusinessTypeIds: ["officeInNJ"],
        });
        await buildUserRoadmap(profileData);
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("permanent-location-business");
      });
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
    it(`adds public-record-filing for public-filing legal structure`, async () => {
      await buildUserRoadmap(generateProfileData({ legalStructureId: "limited-liability-company" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
    });

    it("adds trade-name for general partnership legal structure", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
    });

    it("adds trade-name for sole proprietorship legal structure", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "sole-proprietorship" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
    });

    it("adds tax registration tasks for S-Corp legal structures", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("scorp");

      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "s-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("scorp");
    });

    it("adds nonprofit addon for Nonprofit legal structures", async () => {
      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("nonprofit");

      await buildUserRoadmap(generateStartingProfile({ legalStructureId: "nonprofit" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("nonprofit");
    });
  });

  describe("industry", () => {
    for (const industry of Industries.filter((x) => {
      return x.id !== "generic";
    })) {
      it(`adds ${industry.name} industry and modifications`, async () => {
        await buildUserRoadmap(
          generateStartingProfile({ industryId: industry.id, certifiedInteriorDesigner: true })
        );
        const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
        const shouldNotContainIndustries = Industries.filter((it) => {
          return it.id !== industry.id;
        });
        expect(lastCalledWith.industryId).toBe(industry.id);
        for (const shouldNotContainIndustry of shouldNotContainIndustries) {
          expect(lastCalledWith.addOns).not.toContain(shouldNotContainIndustry);
        }
      });
    }

    describe("on-boarding modifications", () => {
      describe("staffing service", () => {
        for (const industry of Industries.filter((x) => {
          return x.industryOnboardingQuestions.isProvidesStaffingServicesApplicable;
        })) {
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
            generateStartingProfile({
              realEstateAppraisalManagement: false,
              industryId: "generic",
            })
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

    describe("petcare license", () => {
      it("adds petcare license add-on and modification if is true", async () => {
        await buildUserRoadmap(generateStartingProfile({ petCareHousing: true }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("petcare-license");
      });

      it("does not add petcare license add-on and modification if is false", async () => {
        await buildUserRoadmap(generateStartingProfile({ petCareHousing: false }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("petcare-license");
      });
    });

    describe("transportation", () => {
      it("adds home-based-transportation add-on if transportation and home-based", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: true, industryId: "trucking" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("home-based-transportation");
      });

      it("does not add home-based-transportation add-on if transportation and not home-based", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: false, industryId: "trucking" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("home-based-transportation");
      });

      it("does not add home-based-transportation add-on if not transportation", async () => {
        await buildUserRoadmap(generateStartingProfile({ homeBasedBusiness: true, industryId: "generic" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("home-based-transportation");
      });
    });

    describe("planned renovation", () => {
      it("adds if homeBasedBusiness is false and planned renovation is true", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: false, plannedRenovationQuestion: true })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("planned-renovation");
      });

      it("does NOT add if homeBasedBusiness is false and planned renovation is false", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: false, plannedRenovationQuestion: false })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });

      it("does NOT add if homeBasedBusiness is true and planned renovation is true", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: true, plannedRenovationQuestion: true })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });

      it("does NOT show if homeBasedBusiness is true and planned renovation is false", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: true, plannedRenovationQuestion: false })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });

      it("does NOT add if homeBasedBusiness is undefined and planned renovation is undefined", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: undefined, plannedRenovationQuestion: undefined })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });

      it("does NOT add if homeBasedBusiness is true and planned renovation is undefined", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: true, plannedRenovationQuestion: undefined })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });

      it("does NOT add if homeBasedBusiness is false and planned renovation is undefined", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ homeBasedBusiness: false, plannedRenovationQuestion: undefined })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("planned-renovation");
      });
    });

    describe("car service", () => {
      it("adds only the standard car service tasks to the roadmap if the user selects the standard choice", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ carService: "STANDARD", industryId: "car-service" })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("car-service-standard");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("car-service-high-capacity");
      });

      it("adds only the high capacity car service tasks to the roadmap if the user selects the high capacity choice", async () => {
        await buildUserRoadmap(
          generateStartingProfile({ carService: "HIGH_CAPACITY", industryId: "car-service" })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("car-service-high-capacity");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("car-service-standard");
      });

      it("adds both the standard and high capacity car service tasks to the roadmap if the user selects the both choice", async () => {
        await buildUserRoadmap(generateStartingProfile({ carService: "BOTH", industryId: "car-service" }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("car-service-high-capacity");
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("car-service-standard");
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

    describe("elevator owning business", () => {
      it("add elevator-registration task if is an elevator owning business", async () => {
        await buildUserRoadmap(generateStartingProfile({ elevatorOwningBusiness: true }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("elevator-owning-business");
      });

      it("does not add elevator-registration task if not an elevator owning business", async () => {
        await buildUserRoadmap(generateStartingProfile({ elevatorOwningBusiness: false }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("elevator-owning-business");

        await buildUserRoadmap(generateStartingProfile({ elevatorOwningBusiness: undefined }));
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("elevator-owning-business");
      });
    });

    describe("non essential questions", () => {
      it("adds addOn if nonEssentialQuestion value is true", async () => {
        mockGetNonEssentialQuestionAddOn.mockReturnValue("non-essential-add-on-1");
        await buildUserRoadmap(
          generateStartingProfile({
            industryId: "non-essential-question-industry",
            nonEssentialRadioAnswers: {
              "non-essential-question-1": true,
            },
          })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("non-essential-add-on-1");
      });

      it("doesn't add addOn if nonEssentialQuestion value is false", async () => {
        mockGetNonEssentialQuestionAddOn
          .mockReturnValue("non-essential-add-on-2")
          .mockReturnValue("non-essential-add-on-1");
        await buildUserRoadmap(
          generateStartingProfile({
            industryId: "non-essential-question-industry",
            nonEssentialRadioAnswers: {
              "non-essential-question-1": true,
              "non-essential-question-2": false,
            },
          })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("non-essential-add-on-2");
      });

      it("doesn't add addOn if question id is not in industry nonEssentialQuestions", async () => {
        mockGetNonEssentialQuestionAddOn.mockReturnValue("add-on-for-question-not-contained-in-industry");
        await buildUserRoadmap(
          generateStartingProfile({
            industryId: "non-essential-question-industry",
            nonEssentialRadioAnswers: {
              "question-not-contained-in-industry": true,
            },
          })
        );
        expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
          "add-on-for-question-not-contained-in-industry"
        );
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
      expect(task.contentMd).toContain("NAICS code");
      expect(task.contentMd).toContain("621399");
      expect(task.contentMd).toContain("Offices of All Other Miscellaneous Health Practitioners");
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
      expect(naicsTask.contentMd).toContain(`NAICS code`);
      expect(naicsTask.contentMd).toContain(`123456`);
      expect(naicsTask.contentMd).toContain(`Unknown Code`);
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
      expect(task.contentMd).toEqual(`NAICS code ${Config.determineNaicsCode.missingNAICSCodePlaceholder}`);
    });
  });

  describe("interstateLogistics", () => {
    it("does not add interstateLogistics add-on if true and industry is not applicable", () => {
      buildUserRoadmap(generateStartingProfile({ interstateLogistics: true, industryId: "generic" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("interstate-logistics");
    });

    it("adds logistics modification add-on", () => {
      buildUserRoadmap(generateStartingProfile({ industryId: "logistics" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("logistics-modification");
    });

    it("adds interstateLogistics add-on if true", () => {
      buildUserRoadmap(generateStartingProfile({ interstateLogistics: true, industryId: "logistics" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("interstate-logistics");
    });

    it("does not add interstateLogistics if false", () => {
      buildUserRoadmap(generateStartingProfile({ interstateLogistics: false, industryId: "logistics" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("interstate-logistics");
    });
  });

  describe("interstateMoving", () => {
    it("does not add interstateMoving add-on if true and industry is not applicable", () => {
      buildUserRoadmap(generateStartingProfile({ interstateMoving: true, industryId: "generic" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("interstate-moving");
    });

    it("adds interstateMoving add-on if true", () => {
      buildUserRoadmap(generateStartingProfile({ interstateMoving: true, industryId: "moving-company" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("interstate-moving");
    });

    it("does not add interstateMoving add-on if false", () => {
      buildUserRoadmap(generateStartingProfile({ interstateMoving: false, industryId: "moving-company" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("interstate-moving");
    });
  });

  describe("if industry is childcare services", () => {
    it("adds daycare add-on if 6 or more children", () => {
      buildUserRoadmap(generateStartingProfile({ isChildcareForSixOrMore: true, industryId: "daycare" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("daycare");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("family-daycare");
    });

    it("adds family daycare add-on if 5 children or less", () => {
      buildUserRoadmap(generateStartingProfile({ isChildcareForSixOrMore: false, industryId: "daycare" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("family-daycare");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("daycare");
    });
  });

  describe("if industry is pet services", () => {
    it("adds will-sell-pet-care-items add-on if petcare industry and will sell pet care items", () => {
      buildUserRoadmap(generateStartingProfile({ willSellPetCareItems: true, industryId: "petcare" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("will-sell-pet-care-items");
    });

    it("will NOT adds will-sell-pet-care-items add-on if petcare industry and will sell pet care items", () => {
      buildUserRoadmap(generateStartingProfile({ willSellPetCareItems: false, industryId: "petcare" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("will-sell-pet-care-items");
    });
  });

  describe("if industry is employment agency", () => {
    it("adds only job seekers add on if `job seekers` is selected for employmentPersonnelServiceType and `Permanent` is selected for employmentPlacementType", () => {
      buildUserRoadmap(
        generateStartingProfile({
          employmentPersonnelServiceType: "JOB_SEEKERS",
          employmentPlacementType: undefined,
          industryId: "employment-agency",
        })
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("employment-agency-job-seekers");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
        "employment-agency-employers-permanent"
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
        "employment-agency-employers-temporary"
      );
    });

    it("adds only employers permanent add on if `employers` is selected for employmentPersonnelServiceType and `Permanent` is selected for employmentPlacementType", () => {
      buildUserRoadmap(
        generateStartingProfile({
          employmentPersonnelServiceType: "EMPLOYERS",
          employmentPlacementType: "PERMANENT",
          industryId: "employment-agency",
        })
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain(
        "employment-agency-employers-permanent"
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("employment-agency-job-seekers");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
        "employment-agency-employers-temporary"
      );
    });

    it("adds only temporary add on if `employers` is selected for employmentPersonnelServiceType and `Temporary` is selected for employmentPlacementType", () => {
      buildUserRoadmap(
        generateStartingProfile({
          employmentPersonnelServiceType: "EMPLOYERS",
          employmentPlacementType: "TEMPORARY",
          industryId: "employment-agency",
        })
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain(
        "employment-agency-employers-temporary"
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("employment-agency-job-seekers");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain(
        "employment-agency-employers-permanent"
      );
    });

    it("adds temp help and consulting firm combination add on but not employment job seekers if `employers` is selected for employmentPersonnelServiceType and `Both` is selected for employmentPlacementType", () => {
      buildUserRoadmap(
        generateStartingProfile({
          employmentPersonnelServiceType: "EMPLOYERS",
          employmentPlacementType: "BOTH",
          industryId: "employment-agency",
        })
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("employment-agency-employers-both");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("employment-agency-job-seekers");
    });
  });

  describe("if industry is domestic employer", () => {
    it("will NOT contain add-ons", async () => {
      buildUserRoadmap(
        generateStartingProfile({ plannedRenovationQuestion: true, industryId: "domestic-employer" })
      );
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toEqual([]);
    });
  });
});
