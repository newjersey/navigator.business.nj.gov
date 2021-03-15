import { generateRoadmapFromFile, generateStepFromFile } from "../../test/factories";
import { removeLiquorLicenseTasks } from "./removeLiquorLicenseTasks";

describe("removeLiquorLicenseTasks", () => {
  it("removes liquor_license_availability and liquor_license tasks", () => {
    const roadmap = generateRoadmapFromFile({
      steps: [
        generateStepFromFile({
          tasks: ["liquor_license_availability", "something_else"],
        }),
        generateStepFromFile({
          tasks: ["liquor_license", "another_thing"],
        }),
      ],
    });
    const newRoadmap = removeLiquorLicenseTasks(roadmap);
    expect(newRoadmap.steps[0].tasks).toHaveLength(1);
    expect(newRoadmap.steps[0].tasks[0]).toEqual("something_else");

    expect(newRoadmap.steps[1].tasks).toHaveLength(1);
    expect(newRoadmap.steps[1].tasks[0]).toEqual("another_thing");
  });
});
