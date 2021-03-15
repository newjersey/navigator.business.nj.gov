import { BusinessForm } from "../types/form";
import { Roadmap, RoadmapFromFile, Task } from "../types/types";
import { addLegalStructureStep } from "./addLegalStructureStep";
import cloneDeep from "lodash/cloneDeep";
import { removeLiquorLicenseTasks } from "./removeLiquorLicenseTasks";

export const buildRoadmap = async (formData: BusinessForm): Promise<Roadmap | undefined> => {
  const type = formData.businessType?.businessType;
  if (!type) {
    return undefined;
  }

  let roadmapFromFile = cloneDeep({
    ...((await import(`../../roadmaps/business-types/${type}.json`)) as RoadmapFromFile),
  });
  roadmapFromFile = addLegalStructureStep(roadmapFromFile, formData.businessStructure?.businessStructure);

  if (!needsLiquorLicense(formData)) {
    roadmapFromFile = removeLiquorLicenseTasks(roadmapFromFile);
  }

  return {
    ...roadmapFromFile,
    steps: await Promise.all(
      roadmapFromFile.steps.map(async (step) => ({
        ...step,
        tasks: await Promise.all(step.tasks.map(getTaskByIdAsync)),
      }))
    ),
  };
};

const getTaskByIdAsync = async (id: string): Promise<Task> => {
  return (await import(`../../roadmaps/tasks/${id}.json`)) as Task;
};

const needsLiquorLicense = (formData: BusinessForm): boolean => {
  if (!formData.locations?.locations) {
    return false;
  }

  return formData.locations.locations.some((it) => it.license);
};
