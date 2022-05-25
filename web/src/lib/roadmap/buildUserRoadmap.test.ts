import * as fetchMunicipality from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import * as roadmapBuilderModule from "@/lib/roadmap/roadmapBuilder";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateMunicipality,
  generateMunicipalityDetail,
  generateProfileData,
  generateRoadmap,
  generateStep,
  generateTask,
} from "@/test/factories";
import { getLastCalledWith } from "@/test/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Industries } from "@businessnjgovnavigator/shared/";

jest.mock("@/lib/roadmap/roadmapBuilder", () => ({ buildRoadmap: jest.fn() }));
const mockRoadmapBuilder = (roadmapBuilderModule as jest.Mocked<typeof roadmapBuilderModule>).buildRoadmap;

jest.mock("@/lib/async-content-fetchers/fetchMunicipalityById", () => ({
  fetchMunicipalityById: jest.fn(),
}));
const mockFetchMunicipality = (fetchMunicipality as jest.Mocked<typeof fetchMunicipality>)
  .fetchMunicipalityById;

describe("buildUserRoadmap", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRoadmapBuilder.mockResolvedValue(generateRoadmap({}));
  });

  describe("home-based business", () => {
    it("adds non-home-based-business add-on if home-based business is false", async () => {
      await buildUserRoadmap(generateProfileData({ homeBasedBusiness: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("non-home-based-business");
    });

    it("does not add non-home-based-business add-on if home-based business is true", async () => {
      await buildUserRoadmap(generateProfileData({ homeBasedBusiness: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("non-home-based-business");
    });

    it("does not add non-home-based-business add-on if industry is food-truck", async () => {
      await buildUserRoadmap(generateProfileData({ industryId: "food-truck" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("non-home-based-business");
    });
  });

  describe("reseller tasks", () => {
    it("adds reseller task if canBeReseller is true", async () => {
      await buildUserRoadmap(generateProfileData({ industryId: "food-truck" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("reseller");
    });

    it("does not add reseller task if canBeReseller is false", async () => {
      await buildUserRoadmap(generateProfileData({ industryId: "non-medical-transport" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("reseller");
    });
  });

  describe("legal structure", () => {
    it("adds public-record-filing for Public Record Filing legal structures", async () => {
      await buildUserRoadmap(generateProfileData({ legalStructureId: "limited-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");

      await buildUserRoadmap(generateProfileData({ legalStructureId: "c-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
    });

    it("adds formation for formation legal types", async () => {
      await buildUserRoadmap(generateProfileData({ legalStructureId: "limited-liability-company" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");

      await buildUserRoadmap(generateProfileData({ legalStructureId: "limited-liability-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("formation");
    });

    it("adds trade-name for Trade Name legal structures", async () => {
      await buildUserRoadmap(generateProfileData({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");

      await buildUserRoadmap(generateProfileData({ legalStructureId: "sole-proprietorship" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("formation");
    });

    it("adds tax registration tasks for S-Corp legal structures", async () => {
      await buildUserRoadmap(generateProfileData({ legalStructureId: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("scorp");

      await buildUserRoadmap(generateProfileData({ legalStructureId: "s-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("scorp");
    });
  });

  describe("industry", () => {
    Industries.filter((x) => x.id !== "generic").forEach((industry) => {
      it(`adds ${industry.name} industry and modifications`, async () => {
        await buildUserRoadmap(generateProfileData({ industryId: industry.id }));
        const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
        const shouldNotContainIndustries = Industries.filter((it) => it.id !== industry.id);
        expect(lastCalledWith.industryId).toBe(industry.id);
        for (const shouldNotContainIndustry of shouldNotContainIndustries) {
          expect(lastCalledWith.addOns).not.toContain(shouldNotContainIndustry);
        }
      });
    });
  });

  describe("cpa", () => {
    it("adds cpa add-on and modification if is true", async () => {
      await buildUserRoadmap(generateProfileData({ requiresCpa: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cpa");
    });

    it("does not add liquor-license add-on and modification if is true", async () => {
      await buildUserRoadmap(generateProfileData({ requiresCpa: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cpa");
    });
  });

  describe("liquor license", () => {
    it("adds liquor-license add-on and modification if is true", async () => {
      await buildUserRoadmap(generateProfileData({ liquorLicense: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("liquor-license");
    });

    it("does not add liquor-license add-on and modification if is true", async () => {
      await buildUserRoadmap(generateProfileData({ liquorLicense: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("liquor-license");
    });
  });

  describe("cannabis license type", () => {
    it("adds annual-cannabis add-on when cannabis license ANNUAL", async () => {
      await buildUserRoadmap(generateProfileData({ cannabisLicenseType: "ANNUAL" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cannabis-annual");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-conditional");
    });

    it("adds conditional-cannabis add-on when cannabis license CONDITIONAL", async () => {
      await buildUserRoadmap(generateProfileData({ cannabisLicenseType: "CONDITIONAL" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-annual");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("cannabis-conditional");
    });

    it("adds neither cannabis add-on when cannabis license is undefined", async () => {
      await buildUserRoadmap(generateProfileData({ cannabisLicenseType: undefined }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-annual");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("cannabis-conditional");
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
          steps: [
            generateStep({
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
            }),
          ],
        })
      );

      const onboardingData = generateProfileData({ municipality: generateMunicipality({ id: "1234" }) });
      const roadmap = await buildUserRoadmap(onboardingData);

      const municipalityTask = roadmap.steps[0].tasks[0];
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
          steps: [
            generateStep({
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
            }),
          ],
        })
      );

      const onboardingData = generateProfileData({ municipality: undefined });
      const roadmap = await buildUserRoadmap(onboardingData);

      const municipalityTask = roadmap.steps[0].tasks[0];
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
          steps: [
            generateStep({
              tasks: [generateTask({ contentMd: "NAICS code ${naicsCode}" })],
            }),
          ],
        })
      );

      const profileData = generateProfileData({ naicsCode: "123456" });
      const roadmap = await buildUserRoadmap(profileData);

      const task = roadmap.steps[0].tasks[0];
      const expectedTemplate = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
        naicsCode: "123456",
      });
      expect(task.contentMd).toEqual(`NAICS code ${expectedTemplate}`);
    });

    it("replaces tasks with NAICS code and tasks with municipality", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({ id: "1234", townName: "Cool Town" })
      );

      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          steps: [
            generateStep({
              tasks: [
                generateTask({ contentMd: "NAICS code ${naicsCode}" }),
                generateTask({ contentMd: "Visit the ${municipality} Website" }),
              ],
            }),
          ],
        })
      );

      const profileData = generateProfileData({
        naicsCode: "123456",
        municipality: generateMunicipality({ id: "1234" }),
      });
      const roadmap = await buildUserRoadmap(profileData);

      const naicsTask = roadmap.steps[0].tasks[0];
      const municipalityTask = roadmap.steps[0].tasks[1];
      const expectedTemplate = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
        naicsCode: "123456",
      });
      expect(naicsTask.contentMd).toEqual(`NAICS code ${expectedTemplate}`);
      expect(municipalityTask.contentMd).toEqual("Visit the Cool Town Website");
    });

    it("replaces placeholder with empty text if user has no NAICS code", async () => {
      mockRoadmapBuilder.mockResolvedValue(
        generateRoadmap({
          steps: [
            generateStep({
              tasks: [generateTask({ contentMd: "NAICS code ${naicsCode}" })],
            }),
          ],
        })
      );

      const profileData = generateProfileData({ naicsCode: "" });
      const roadmap = await buildUserRoadmap(profileData);

      const task = roadmap.steps[0].tasks[0];
      expect(task.contentMd).toEqual(
        `NAICS code ${Config.determineNaicsCode.registerForTaxesMissingNAICSCodePlaceholder}`
      );
    });
  });
});
