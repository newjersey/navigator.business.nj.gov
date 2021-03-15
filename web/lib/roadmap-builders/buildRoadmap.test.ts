/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateFormData } from "../../test/factories";
import { buildRoadmap } from "./buildRoadmap";
import { Roadmap } from "../types/types";

describe("buildRoadmap", () => {
  it("returns undefined if no business type present", async () => {
    const formData = generateFormData({ businessType: { businessType: undefined } });
    expect(await buildRoadmap(formData)).toEqual(undefined);
  });

  it("loads roadmap by form data business type", async () => {
    let formData = generateFormData({ businessType: { businessType: "restaurant" } });
    expect((await buildRoadmap(formData))?.type).toEqual("restaurant");

    formData = generateFormData({ businessType: { businessType: "e-commerce" } });
    expect((await buildRoadmap(formData))?.type).toEqual("e-commerce");

    formData = generateFormData({ businessType: { businessType: "home-contractor" } });
    expect((await buildRoadmap(formData))?.type).toEqual("home-contractor");
  });

  describe("business structure", () => {
    it("adds search business name step if structure in PublicRecordFiling group", async () => {
      const formData = generateFormData({
        businessStructure: { businessStructure: "Limited Liability Company (LLC)" },
      });
      const roadmap = await buildRoadmap(formData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("search_business_name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("register_trade_name");
    });

    it("shows trade name step if structure in TradeName group", async () => {
      const formData = generateFormData({ businessStructure: { businessStructure: "General Partnership" } });
      const roadmap = await buildRoadmap(formData);
      expect(roadmap?.steps.map((it) => it.name)).toContain("Form & Register Your Business");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).not.toContain("search_business_name");
      expect(roadmap?.steps[2].tasks.map((it) => it.id)).toContain("register_trade_name");
    });
  });

  describe("liquor license", () => {
    const containsLiquorSteps = (roadmap: Roadmap): boolean => {
      const taskIds = roadmap.steps.flatMap((step) => step.tasks.map((it) => it.id));
      return taskIds.includes("liquor_license_availability") && taskIds.includes("liquor_license");
    };

    describe("when the roadmap does not have liquor license steps", () => {
      it("does not show liquor license step even when any location includes it", async () => {
        const formData = generateFormData({
          businessType: { businessType: "e-commerce" },
          locations: { locations: [{ license: true }, { license: false }] },
        });
        const roadmap = await buildRoadmap(formData);
        expect(containsLiquorSteps(roadmap!)).toBe(false);
      });
    });

    describe("when the roadmap has liquor license tasks", () => {
      it("removes liquor license tasks if no locations", async () => {
        const formData = generateFormData({
          businessType: { businessType: "restaurant" },
          locations: {},
        });
        const roadmap = await buildRoadmap(formData);
        expect(containsLiquorSteps(roadmap!)).toBe(false);
      });

      it("removes liquor license tasks if no location includes it", async () => {
        const formData = generateFormData({
          businessType: { businessType: "restaurant" },
          locations: { locations: [{ license: false }] },
        });
        const roadmap = await buildRoadmap(formData);
        expect(containsLiquorSteps(roadmap!)).toBe(false);
      });

      it("keeps liquor license tasks if any location includes it", async () => {
        const formData = generateFormData({
          businessType: { businessType: "restaurant" },
          locations: { locations: [{ license: true }, { license: false }] },
        });
        const roadmap = await buildRoadmap(formData);
        expect(containsLiquorSteps(roadmap!)).toBe(true);
      });
    });
  });
});
