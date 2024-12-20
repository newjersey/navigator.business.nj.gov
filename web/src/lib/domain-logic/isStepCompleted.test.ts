import { isStepCompleted } from "@/lib/domain-logic/isStepCompleted";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared";

describe("isStepCompleted", () => {
  it("returns false if roadmap is undefined", () => {
    expect(isStepCompleted(undefined, generateStep({}), generateBusiness(generateUserData({}), {}))).toEqual(
      false
    );
  });

  it("returns true if every task in roadmap associated with the step is completed", () => {
    const business = generateBusiness(generateUserData({}), {
      taskProgress: {
        "step1-task1": "COMPLETED",
        "step1-task2": "COMPLETED",
        "step2-task1": "IN_PROGRESS",
      },
    });

    const roadmap = generateRoadmap({
      tasks: [
        generateTask({ id: "step1-task1", stepNumber: 1 }),
        generateTask({ id: "step1-task2", stepNumber: 1 }),
        generateTask({ id: "step2-task1", stepNumber: 2 }),
      ],
    });

    const step = generateStep({ stepNumber: 1 });

    expect(isStepCompleted(roadmap, step, business)).toEqual(true);
  });

  it("returns false if some tasks in roadmap associated with step are not completed", () => {
    const business = generateBusiness(generateUserData({}), {
      taskProgress: {
        "step1-task1": "COMPLETED",
        "step1-task2": "IN_PROGRESS",
        "step2-task1": "COMPLETED",
      },
    });

    const roadmap = generateRoadmap({
      tasks: [
        generateTask({ id: "step1-task1", stepNumber: 1 }),
        generateTask({ id: "step1-task2", stepNumber: 1 }),
        generateTask({ id: "step2-task1", stepNumber: 2 }),
      ],
    });

    const step = generateStep({ stepNumber: 1 });

    expect(isStepCompleted(roadmap, step, business)).toEqual(false);
  });
});
