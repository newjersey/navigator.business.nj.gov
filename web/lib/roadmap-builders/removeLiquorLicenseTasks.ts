import { RoadmapFromFile } from "../types/types";

export const removeLiquorLicenseTasks = (roadmap: RoadmapFromFile): RoadmapFromFile => {
  const stepsWithRemoved = roadmap.steps.map((step) => {
    const tasksWithRemoved = step.tasks.filter(
      (task) => !(task === "liquor_license_availability" || task === "liquor_license")
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
