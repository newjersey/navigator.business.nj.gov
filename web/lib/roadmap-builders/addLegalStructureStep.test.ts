import { generateRoadmap, generateStep, generateTask } from "../../test/factories";
import { addLegalStructureStep } from "./addLegalStructureStep";
import { Roadmap } from "../types/Roadmap";

export const allLegalStructureTasks = {
  search_business_name: generateTask({ id: "search_business_name", name: "search_business_name" }),
  register_for_ein: generateTask({ id: "register_for_ein", name: "register_for_ein" }),
  form_business_entity: generateTask({ id: "form_business_entity", name: "form_business_entity" }),
  alternate_name: generateTask({ id: "alternate_name", name: "alternate_name" }),
  register_for_taxes: generateTask({ id: "register_for_taxes", name: "register_for_taxes" }),
  register_trade_name: generateTask({ id: "register_trade_name", name: "register_trade_name" }),
};

describe("addLegalStructureStep", () => {
  it("adds the Register Business step to the roadmap", () => {
    const roadmap = generateRoadmap({ steps: [] });
    const newRoadmap = addLegalStructureStep(
      roadmap,
      "Limited Liability Company (LLC)",
      allLegalStructureTasks
    );
    expect(newRoadmap.steps).toHaveLength(1);
    expect(newRoadmap.steps[0].id).toEqual("register_business");
  });

  it("filters out missing undefined tasks", () => {
    const newRoadmap = addLegalStructureStep(
      generateRoadmap({ steps: [] }),
      "Limited Liability Company (LLC)",
      {}
    );

    expect(newRoadmap.steps[0].tasks).toHaveLength(0);
  });

  it("inputs the step as step 3 of the steps list", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({ step_number: 1 }),
        generateStep({ step_number: 2 }),
        generateStep({ step_number: 4 }),
      ],
    });

    const newRoadmap = addLegalStructureStep(
      roadmap,
      "Limited Liability Company (LLC)",
      allLegalStructureTasks
    );
    expect(newRoadmap.steps).toHaveLength(4);
    expect(newRoadmap.steps[2].id).toEqual("register_business");
    expect(newRoadmap.steps.map((it) => it.step_number)).toEqual([1, 2, 3, 4]);
  });

  describe("for PublicRecordFiling group LegalStructure", () => {
    it("shows the PublicRecordFiling group specific tasks", () => {
      const roadmap = generateRoadmap({ steps: [] });

      const assertSteps = (roadmap: Roadmap) => {
        expect(roadmap.steps[0].tasks.map((it) => it.id)).toEqual([
          "search_business_name",
          "register_for_ein",
          "form_business_entity",
          "alternate_name",
          "register_for_taxes",
        ]);
      };

      assertSteps(addLegalStructureStep(roadmap, "Limited Liability Company (LLC)", allLegalStructureTasks));
      assertSteps(addLegalStructureStep(roadmap, "Limited Partnership (LP)", allLegalStructureTasks));
      assertSteps(
        addLegalStructureStep(roadmap, "Limited Liability Partnership (LLP)", allLegalStructureTasks)
      );
      assertSteps(addLegalStructureStep(roadmap, "C-Corporation", allLegalStructureTasks));
      assertSteps(addLegalStructureStep(roadmap, "B-Corporation", allLegalStructureTasks));
      assertSteps(addLegalStructureStep(roadmap, "S-Corporation", allLegalStructureTasks));
    });
  });

  describe("for TradeName group LegalStructure", () => {
    it("shows the TradeName group specific tasks", () => {
      const roadmap = generateRoadmap({ steps: [] });

      const assertSteps = (roadmap: Roadmap) => {
        expect(roadmap.steps[0].tasks.map((it) => it.id)).toEqual([
          "register_trade_name",
          "register_for_ein",
          "register_for_taxes",
        ]);
      };

      assertSteps(addLegalStructureStep(roadmap, "General Partnership", allLegalStructureTasks));
      assertSteps(addLegalStructureStep(roadmap, "Sole Proprietorship", allLegalStructureTasks));
    });
  });
});
