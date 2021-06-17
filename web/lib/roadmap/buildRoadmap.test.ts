/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { buildRoadmap } from "./buildRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { generateMunicipality, generateMunicipalityDetail, generateOnboardingData } from "@/test/factories";
import * as fetchMunicipality from "@/lib/async-content-fetchers/fetchMunicipalityById";

jest.mock("@/lib/async-content-fetchers/fetchMunicipalityById", () => ({
  fetchMunicipalityById: jest.fn(),
}));
const mockFetchMunicipality = (fetchMunicipality as jest.Mocked<typeof fetchMunicipality>)
  .fetchMunicipalityById;

describe("buildRoadmap", () => {
  const getTasksByStepId = (roadmap: Roadmap, id: string): string[] => {
    return roadmap.steps.find((it) => it.id === id)!.tasks.map((it) => it.id);
  };

  const getTaskById = (roadmap: Roadmap, id: string): Task => {
    return roadmap.steps.flatMap((step) => step.tasks).find((task: Task) => task.id === id)!;
  };

  beforeEach(() => {
    mockFetchMunicipality.mockResolvedValue(generateMunicipalityDetail({}));
  });

  it("loads a generic roadmap when no industry data present", async () => {
    const onboardingData = generateOnboardingData({
      industry: "generic",
    });
    expect((await buildRoadmap(onboardingData)).type).toEqual("generic");
  });

  it("orders tasks by weight", async () => {
    const onboardingData = generateOnboardingData({ industry: "home-contractor" });
    const roadmap = await buildRoadmap(onboardingData);
    const dueDiligenceTasks = getTasksByStepId(roadmap, "due-diligence");
    expect(dueDiligenceTasks).toEqual([
      "check-site-suitability", // weight: 2
      "check-site-requirements",
      "reseller", // weight: 10
      "research-insurance-needs-home-contractor", // weight: 10
    ]);
  });

  it("removes step 5 if it has no tasks", async () => {
    const onboardingData = generateOnboardingData({
      industry: "generic",
      legalStructure: undefined,
      homeBasedBusiness: true,
      liquorLicense: false,
      municipality: undefined,
    });
    const roadmap = await buildRoadmap(onboardingData);
    expect(roadmap.steps).toHaveLength(4);
    expect(roadmap.steps.find((step) => step.id === "inspection-requirements")).toBeUndefined();
  });

  describe("restaurant", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "restaurant", homeBasedBusiness: false });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds restaurant specific tasks", () => {
      expect(roadmap.type).toEqual("restaurant");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("floor-plan-approval-doh");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("food-safety-course");
    });
  });

  describe("e-commerce", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "e-commerce" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds e-commerce specific type", () => {
      expect(roadmap.type).toEqual("e-commerce");
    });
  });

  describe("home contractor", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "home-contractor" });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds home contractor specific tasks", () => {
      expect(roadmap.type).toEqual("home-contractor");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("register-consumer-affairs");
    });

    it("modifies the text for insurance needs", () => {
      const insuranceNeedsTask = getTaskById(roadmap, "research-insurance-needs");
      expect(insuranceNeedsTask.contentMd).toContain("contractor");
    });
  });

  describe("cosmetology", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const onboardingData = generateOnboardingData({ industry: "cosmetology", homeBasedBusiness: false });
      roadmap = await buildRoadmap(onboardingData);
    });

    it("adds cosmetology specific tasks", () => {
      expect(roadmap.type).toEqual("cosmetology");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("apply-for-shop-license");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("individual-staff-licenses");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("board-inspection");
    });

    it("modifies the text for site requirements task", () => {
      const siteTask = getTaskById(roadmap, "check-site-requirements");
      expect(siteTask.contentMd).toContain("Consumer Affairs");
    });
  });

  describe("business structure", () => {
    it("adds search business name tasks if structure in PublicRecordFiling group", async () => {
      const onboardingData = generateOnboardingData({ legalStructure: "limited-liability-company" });
      const roadmap = await buildRoadmap(onboardingData);
      expect(getTasksByStepId(roadmap, "register-business")).toContain("search-business-name");
      expect(getTasksByStepId(roadmap, "register-business")).not.toContain("register-trade-name");
    });

    it("adds trade name tasks if structure in TradeName group", async () => {
      const onboardingData = generateOnboardingData({ legalStructure: "general-partnership" });
      const roadmap = await buildRoadmap(onboardingData);
      expect(getTasksByStepId(roadmap, "register-business")).not.toContain("search-business-name");
      expect(getTasksByStepId(roadmap, "register-business")).toContain("register-trade-name");
    });
  });

  describe("municipality", () => {
    it("adds callToAction from the user municipality", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({
          id: "123",
          townWebsite: "www.cooltown.com",
          townName: "Cool Town",
          townDisplayName: "Cool Town (NJ)",
        })
      );

      const onboardingData = generateOnboardingData({ municipality: generateMunicipality({ id: "1234" }) });
      const roadmap = await buildRoadmap(onboardingData);

      const municipalityTask = getTaskById(roadmap, "check-local-requirements");
      expect(municipalityTask.callToActionLink).toEqual("www.cooltown.com");
      expect(municipalityTask.callToActionText).toEqual("Visit the Cool Town Website");
    });

    it("replaces placeholder text", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({
          id: "123",
          townWebsite: "www.cooltown.com",
          townName: "Cool Town",
          townDisplayName: "Cool Town (NJ)",
          countyName: "Bergen County",
          countyClerkPhone: "555-1234",
          countyClerkWebsite: "www.example.com/clerk",
        })
      );

      const onboardingData = generateOnboardingData({ municipality: generateMunicipality({ id: "123" }) });
      const roadmap = await buildRoadmap(onboardingData);
      const municipalityTask = getTaskById(roadmap, "check-local-requirements");

      expect(municipalityTask.callToActionLink).toContain("www.cooltown.com");
      expect(municipalityTask.callToActionText).toContain("Cool Town");
      expect(municipalityTask.contentMd).toContain("Cool Town");
      expect(municipalityTask.contentMd).toContain("555-1234");
      expect(municipalityTask.contentMd).toContain("www.example.com/clerk");
    });
  });

  describe("home based business", () => {
    it("adds physical location tasks when homeBasedBusiness is false", async () => {
      const onboardingData = generateOnboardingData({ homeBasedBusiness: false });
      const roadmap = await buildRoadmap(onboardingData);

      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("check-site-requirements");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).toContain("sign-lease");
      expect(getTasksByStepId(roadmap, "inspection-requirements")).toContain("certificate-of-occupancy");
    });

    it("does not add physical location tasks when homeBasedBusiness is true", async () => {
      const onboardingData = generateOnboardingData({ homeBasedBusiness: true });
      const roadmap = await buildRoadmap(onboardingData);

      expect(getTasksByStepId(roadmap, "due-diligence")).not.toContain("identify-potential-lease");
      expect(getTasksByStepId(roadmap, "due-diligence")).not.toContain("check-site-requirements");
      expect(getTasksByStepId(roadmap, "lease-and-permits")).not.toContain("sign-lease");
    });
  });

  describe("liquor license", () => {
    it("adds liquor license tasks when liquorLicense is true", async () => {
      const onboardingData = generateOnboardingData({ liquorLicense: true });
      const roadmap = await buildRoadmap(onboardingData);
      expect(getTasksByStepId(roadmap, "due-diligence")).toContain("liquor-license-availability");
    });

    it("does not add liquor license tasks when liquorLicense is false", async () => {
      const onboardingData = generateOnboardingData({ liquorLicense: false });
      const roadmap = await buildRoadmap(onboardingData);
      expect(getTasksByStepId(roadmap, "due-diligence")).not.toContain("liquor-license-availability");
    });

    it("modifies the text for local requirements task when liquor license true", async () => {
      const onboardingData = generateOnboardingData({ liquorLicense: true, homeBasedBusiness: false });
      const roadmap = await buildRoadmap(onboardingData);
      const siteTask = getTaskById(roadmap, "check-local-requirements");
      expect(siteTask.contentMd).toContain("liquor");
    });

    it("replaces placeholder text", async () => {
      mockFetchMunicipality.mockResolvedValue(
        generateMunicipalityDetail({
          id: "123",
          countyClerkWebsite: "www.example.com/clerk",
        })
      );

      const onboardingData = generateOnboardingData({
        liquorLicense: true,
        municipality: generateMunicipality({ id: "123" }),
      });
      const roadmap = await buildRoadmap(onboardingData);
      const liquorAvailabilityTask = getTaskById(roadmap, "liquor-license-availability");
      expect(liquorAvailabilityTask.callToActionLink).toEqual("www.example.com/clerk");
    });

    it("removes call to action when missing municipality", async () => {
      const onboardingData = generateOnboardingData({ liquorLicense: true });
      onboardingData.municipality = undefined;
      const roadmap = await buildRoadmap(onboardingData);

      const liquorAvailabilityTask = getTaskById(roadmap, "liquor-license-availability");
      expect(liquorAvailabilityTask.callToActionLink).toEqual("");
    });
  });
});
