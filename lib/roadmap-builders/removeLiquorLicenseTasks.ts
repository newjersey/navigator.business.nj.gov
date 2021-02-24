import { Roadmap } from "../types/Roadmap";

export const removeLiquorLicenseTasks = (roadmap: Roadmap): Roadmap => {
  const stepsWithRemoved = roadmap.steps.map((step) => {
    const tasksWithRemoved = step.tasks.filter(
      (task) => !(task.id === "liquor_license_availability" || task.id === "liquor_license")
    );

    return {
      ...step,
      tasks: tasksWithRemoved,
    };
  });

  return {
    ...roadmap,
    steps: stepsWithRemoved,
  };
};
