import * as roadmapBuilderModule from "@/lib/roadmap/roadmapBuilder";
import {
  generateMunicipality,
  generateMunicipalityDetail,
  generateOnboardingData,
  generateRoadmap,
  generateStep,
  generateTask,
} from "@/test/factories";
import { getLastCalledWith } from "@/test/helpers";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import * as fetchMunicipality from "@/lib/async-content-fetchers/fetchMunicipalityById";

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
  });

  describe("home-based business", () => {
    it("adds physical-location add-on if home-based business is false", async () => {
      await buildUserRoadmap(generateOnboardingData({ homeBasedBusiness: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("physical-location");
    });

    it("does not add physical-location add-on if home-based business is true", async () => {
      await buildUserRoadmap(generateOnboardingData({ homeBasedBusiness: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("physical-location");
    });
  });

  describe("legal structure", () => {
    it("adds public-record-filing for Public Record Filing legal structures", async () => {
      await buildUserRoadmap(generateOnboardingData({ legalStructure: "limited-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");

      await buildUserRoadmap(generateOnboardingData({ legalStructure: "limited-liability-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");

      await buildUserRoadmap(generateOnboardingData({ legalStructure: "limited-liability-company" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");

      await buildUserRoadmap(generateOnboardingData({ legalStructure: "c-corporation" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("public-record-filing");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("trade-name");
    });

    it("adds trade-name for Trade Name legal structures", async () => {
      await buildUserRoadmap(generateOnboardingData({ legalStructure: "general-partnership" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");

      await buildUserRoadmap(generateOnboardingData({ legalStructure: "sole-proprietorship" }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("trade-name");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("public-record-filing");
    });
  });

  describe("industry", () => {
    it("adds cosmetology industry and modifications", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "cosmetology" }));
      expectOnlyIndustry("cosmetology", getLastCalledWith(mockRoadmapBuilder)[0]);
    });

    it("adds restaurant industry and modifications", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "restaurant" }));
      expectOnlyIndustry("restaurant", getLastCalledWith(mockRoadmapBuilder)[0]);
    });

    it("adds home-contractor industry and modifications", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "home-contractor" }));
      expectOnlyIndustry("home-contractor", getLastCalledWith(mockRoadmapBuilder)[0]);
    });

    it("adds e-commerce industry and modifications", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "e-commerce" }));
      expectOnlyIndustry("e-commerce", getLastCalledWith(mockRoadmapBuilder)[0]);
    });

    it("adds cleaning aid industry and modifications", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "cleaning-aid" }));
      expectOnlyIndustry("cleaning-aid", getLastCalledWith(mockRoadmapBuilder)[0]);
    });

    it("adds another-industry add-on when industry is generic", async () => {
      await buildUserRoadmap(generateOnboardingData({ industry: "generic" }));
      const lastCalledWith = getLastCalledWith(mockRoadmapBuilder)[0];
      expect(lastCalledWith.addOns).toContain("another-industry");
      expect(lastCalledWith.addOns).not.toContain("restaurant");
      expect(lastCalledWith.addOns).not.toContain("cosmetology");
      expect(lastCalledWith.addOns).not.toContain("e-commerce");
      expect(lastCalledWith.addOns).not.toContain("home-contractor");

      expect(lastCalledWith.modifications).not.toContain("restaurant");
      expect(lastCalledWith.modifications).not.toContain("cosmetology");
      expect(lastCalledWith.modifications).not.toContain("e-commerce");
      expect(lastCalledWith.modifications).not.toContain("home-contractor");
    });

    const expectOnlyIndustry = (
      industry: string,
      lastCalledWith: { addOns: string[]; modifications: string[] }
    ): void => {
      const industries = [
        "cosmetology",
        "e-commerce",
        "restaurant",
        "home-contractor",
        "cleaning-aid",
        "another-industry",
      ];
      const shouldNotContainIndustries = industries.filter((it) => it !== industry);

      expect(lastCalledWith.addOns).toContain(industry);
      expect(lastCalledWith.modifications).toContain(industry);

      for (const shouldNotContainIndustry of shouldNotContainIndustries) {
        expect(lastCalledWith.addOns).not.toContain(shouldNotContainIndustry);
        expect(lastCalledWith.modifications).not.toContain(shouldNotContainIndustry);
      }
    };
  });

  describe("liquor license", () => {
    it("adds liquor-license add-on and modification if is true", async () => {
      await buildUserRoadmap(generateOnboardingData({ liquorLicense: true }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).toContain("liquor-license");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].modifications).toContain("liquor-license");
    });

    it("does not add liquor-license add-on and modification if is true", async () => {
      await buildUserRoadmap(generateOnboardingData({ liquorLicense: false }));
      expect(getLastCalledWith(mockRoadmapBuilder)[0].addOns).not.toContain("liquor-license");
      expect(getLastCalledWith(mockRoadmapBuilder)[0].modifications).not.toContain("liquor-license");
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

      const onboardingData = generateOnboardingData({ municipality: generateMunicipality({ id: "1234" }) });
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

      const onboardingData = generateOnboardingData({ municipality: undefined });
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
});
