import { generateRoadmap, generateStep, generateTask } from "../../test/factories";
import { removeLiquorLicenseTasks } from "./removeLiquorLicenseTasks";

describe("removeLiquorLicenseTasks", () => {
  it("removes liquor_license_availability and liquor_license tasks", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({
          tasks: [
            generateTask({ id: "liquor_license_availability" }),
            generateTask({ id: "something_else" }),
          ],
        }),
        generateStep({
          tasks: [generateTask({ id: "liquor_license" }), generateTask({ id: "another_thing" })],
        }),
      ],
    });
    const newRoadmap = removeLiquorLicenseTasks(roadmap);
    expect(newRoadmap.steps[0].tasks).toHaveLength(1);
    expect(newRoadmap.steps[0].tasks[0].id).toEqual("something_else");

    expect(newRoadmap.steps[1].tasks).toHaveLength(1);
    expect(newRoadmap.steps[1].tasks[0].id).toEqual("another_thing");
  });
});
