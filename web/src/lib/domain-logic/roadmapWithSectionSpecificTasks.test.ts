import { roadmapWithSectionSpecificTasks } from "@/lib/domain-logic/roadmapWithSectionSpecificTasks";
import { generateStep, generateTask } from "@/test/factories";

describe("roadmapWithSectionSpecificTasks", () => {
  const steps = [
    generateStep({ section: "PLAN", stepNumber: 1 }),
    generateStep({ section: "PLAN", stepNumber: 2 }),
    generateStep({ section: "START", stepNumber: 3 }),
    generateStep({ section: "START", stepNumber: 4 }),
    generateStep({ section: undefined, stepNumber: 5 }),
    generateStep({ section: undefined, stepNumber: 6 }),
  ];

  const planTasks = [generateTask({ stepNumber: 1 }), generateTask({ stepNumber: 2 })];

  const startTasks = [generateTask({ stepNumber: 3 }), generateTask({ stepNumber: 4 })];

  const otherTasks = [generateTask({ stepNumber: 5 }), generateTask({ stepNumber: 6 })];

  it("returns roadmap with tasks in plan section", () => {
    const roadmap = {
      steps: steps,
      tasks: [...planTasks, ...startTasks, ...otherTasks],
    };
    const result = roadmapWithSectionSpecificTasks(roadmap, "PLAN");
    expect(result).toEqual({ steps: [...steps], tasks: [...planTasks] });
  });

  it("returns roadmap with tasks in start section", () => {
    const roadmap = {
      steps: steps,
      tasks: [...planTasks, ...startTasks, ...otherTasks],
    };
    const result = roadmapWithSectionSpecificTasks(roadmap, "START");
    expect(result).toEqual({ steps: [...steps], tasks: [...startTasks] });
  });
});
