import { generateRoadmapFromFile, generateStepFromFile } from "../../test/factories";
import { addLegalStructureStep } from "./addLegalStructureStep";
import { RoadmapFromFile } from "../types/types";

describe("addLegalStructureStep", () => {
  it("adds the Register Business step to the roadmap", () => {
    const roadmap = generateRoadmapFromFile({ steps: [] });
    const newRoadmap = addLegalStructureStep(roadmap, "Limited Liability Company (LLC)");
    expect(newRoadmap.steps).toHaveLength(1);
    expect(newRoadmap.steps[0].id).toEqual("register_business");
  });

  it("inputs the step as step 3 of the steps list", () => {
    const roadmap = generateRoadmapFromFile({
      steps: [
        generateStepFromFile({ step_number: 1 }),
        generateStepFromFile({ step_number: 2 }),
        generateStepFromFile({ step_number: 4 }),
      ],
    });

    const newRoadmap = addLegalStructureStep(roadmap, "Limited Liability Company (LLC)");
    expect(newRoadmap.steps).toHaveLength(4);
    expect(newRoadmap.steps[2].id).toEqual("register_business");
    expect(newRoadmap.steps.map((it) => it.step_number)).toEqual([1, 2, 3, 4]);
  });

  describe("for PublicRecordFiling group LegalStructure", () => {
    it("shows the PublicRecordFiling group specific tasks", () => {
      const roadmap = generateRoadmapFromFile({ steps: [] });

      const assertSteps = (roadmap: RoadmapFromFile) => {
        expect(roadmap.steps[0].tasks).toEqual([
          "search_business_name",
          "register_for_ein",
          "form_business_entity",
          "alternate_name",
          "register_for_taxes",
        ]);
      };

      assertSteps(addLegalStructureStep(roadmap, "Limited Liability Company (LLC)"));
      assertSteps(addLegalStructureStep(roadmap, "Limited Partnership (LP)"));
      assertSteps(addLegalStructureStep(roadmap, "Limited Liability Partnership (LLP)"));
      assertSteps(addLegalStructureStep(roadmap, "C-Corporation"));
      assertSteps(addLegalStructureStep(roadmap, "B-Corporation"));
      assertSteps(addLegalStructureStep(roadmap, "S-Corporation"));
    });
  });

  describe("for TradeName group LegalStructure", () => {
    it("shows the TradeName group specific tasks", () => {
      const roadmap = generateRoadmapFromFile({ steps: [] });

      const assertSteps = (roadmap: RoadmapFromFile) => {
        expect(roadmap.steps[0].tasks).toEqual([
          "register_trade_name",
          "register_for_ein",
          "register_for_taxes",
        ]);
      };

      assertSteps(addLegalStructureStep(roadmap, "General Partnership"));
      assertSteps(addLegalStructureStep(roadmap, "Sole Proprietorship"));
    });
  });

  describe("for unset LegalStructure", () => {
    it("shows generic step", () => {
      const roadmap = generateRoadmapFromFile({ steps: [] });

      const newRoadmap = addLegalStructureStep(roadmap, undefined);
      expect(newRoadmap.steps[0].tasks).toEqual([]);
      expect(newRoadmap.steps[0].description).toEqual("Input your legal entity structure to view tasks");
    });
  });
});
