import { generateRoadmap, generateStep } from "../../test/factories";
import { addLegalStructureStep } from "./addLegalStructureStep";

describe("addLegalStructureStep", () => {
  it("adds the Register Business step to the roadmap", () => {
    const roadmap = generateRoadmap({ steps: [] });
    const newRoadmap = addLegalStructureStep(roadmap);
    expect(newRoadmap.steps).toHaveLength(1);
    expect(newRoadmap.steps[0].id).toEqual("register_business");
  });

  it("inputs the step as step 3 of the steps list", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({ step_number: 1 }),
        generateStep({ step_number: 2 }),
        generateStep({ step_number: 4 }),
      ],
    });

    const newRoadmap = addLegalStructureStep(roadmap);
    expect(newRoadmap.steps).toHaveLength(4);
    expect(newRoadmap.steps[2].id).toEqual("register_business");
    expect(newRoadmap.steps.map((it) => it.step_number)).toEqual([1, 2, 3, 4]);
  });
});
