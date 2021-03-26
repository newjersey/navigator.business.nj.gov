/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateFormData } from "../../test/factories";
import { buildRoadmap } from "./buildRoadmap";
import { Roadmap } from "../types/types";
import { genericRoadmap } from "../../test/generic-roadmap";

describe("buildRoadmap", () => {
  const getTasksByStepId = (roadmap: Roadmap, id: string): string[] => {
    return roadmap.steps.find((it) => it.id === id)!.tasks.map((it) => it.id);
  };

  it("loads a generic roadmap when no data present", async () => {
    const formData = generateFormData({
      businessType: { businessType: undefined },
      businessStructure: { businessStructure: undefined },
    });
    expect(await buildRoadmap(formData)).toEqual(genericRoadmap);
  });

  it("orders tasks by weight", async () => {
    const formData = generateFormData({ businessType: { businessType: "home-contractor" } });
    const roadmap = await buildRoadmap(formData);
    const dueDiligenceTasks = getTasksByStepId(roadmap, "due_diligence");
    expect(dueDiligenceTasks).toEqual([
      "identify_potential_lease", // weight: 1
      "check_site_requirements", // weight: 2
      "research_insurance_needs", // weight: 10
    ]);
  });

  describe("restaurant", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const formData = generateFormData({ businessType: { businessType: "restaurant" } });
      roadmap = await buildRoadmap(formData);
    });

    it("adds restaurant specific tasks", () => {
      expect(roadmap.type).toEqual("restaurant");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("floor_plan_approval_doh");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("food_safety_course");
    });

    it("adds physical location tasks", () => {
      expect(getTasksByStepId(roadmap, "due_diligence")).toContain("identify_potential_lease");
      expect(getTasksByStepId(roadmap, "due_diligence")).toContain("check_site_requirements");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("sign_lease");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("certificate_of_occupancy");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("fire_permit");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("mercantile_license");
    });

    describe("liquor license", () => {
      it("does not add liquor license tasks if no location includes it", async () => {
        const formData = generateFormData({
          businessType: { businessType: "restaurant" },
          locations: { locations: [{ license: false }] },
        });
        roadmap = await buildRoadmap(formData);

        expect(getTasksByStepId(roadmap, "due_diligence")).not.toContain("liquor_license_availability");
        expect(getTasksByStepId(roadmap, "lease_and_permits")).not.toContain("liquor_license");
      });

      it("adds liquor license tasks if any location includes it", async () => {
        const formData = generateFormData({
          businessType: { businessType: "restaurant" },
          locations: { locations: [{ license: true }, { license: false }] },
        });
        roadmap = await buildRoadmap(formData);

        expect(getTasksByStepId(roadmap, "due_diligence")).toContain("liquor_license_availability");
        expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("liquor_license");
      });
    });
  });

  describe("e-commerce", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const formData = generateFormData({ businessType: { businessType: "e-commerce" } });
      roadmap = await buildRoadmap(formData);
    });

    it("adds e-commerce specific type", () => {
      expect(roadmap.type).toEqual("e-commerce");
    });
  });

  describe("home contractor", () => {
    let roadmap: Roadmap;
    beforeEach(async () => {
      const formData = generateFormData({ businessType: { businessType: "home-contractor" } });
      roadmap = await buildRoadmap(formData);
    });

    it("adds home contractor specific tasks", () => {
      expect(roadmap.type).toEqual("home-contractor");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("register_consumer_affairs");
    });

    it("adds physical location tasks", () => {
      expect(getTasksByStepId(roadmap, "due_diligence")).toContain("identify_potential_lease");
      expect(getTasksByStepId(roadmap, "due_diligence")).toContain("check_site_requirements");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("sign_lease");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("certificate_of_occupancy");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("fire_permit");
      expect(getTasksByStepId(roadmap, "lease_and_permits")).toContain("mercantile_license");
    });

    it("modifies the text for insurance needs", () => {
      const dueDiligenceStep = roadmap.steps.find((it) => it.id === "due_diligence")!;
      const insuranceNeeds = dueDiligenceStep.tasks.find((it) => it.id === "research_insurance_needs")!;
      expect(insuranceNeeds.description).toContain("Home contractors need to");
    });
  });

  describe("business structure", () => {
    it("adds search business name tasks if structure in PublicRecordFiling group", async () => {
      const formData = generateFormData({
        businessStructure: { businessStructure: "Limited Liability Company (LLC)" },
      });
      const roadmap = await buildRoadmap(formData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("search_business_name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("register_trade_name");
    });

    it("adds trade name tasks if structure in TradeName group", async () => {
      const formData = generateFormData({ businessStructure: { businessStructure: "General Partnership" } });
      const roadmap = await buildRoadmap(formData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("search_business_name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("register_trade_name");
    });
  });
});
