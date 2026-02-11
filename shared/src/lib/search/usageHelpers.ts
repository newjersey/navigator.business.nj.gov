import TaskDependencies from "@businessnjgovnavigator/content/roadmaps/task-dependencies.json";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import { Match } from "@businessnjgovnavigator/shared/lib/search/typesForSearch";
import { IndustryRoadmap } from "@businessnjgovnavigator/shared/types";

const addTaskDependency = (match: Match, dependency: string): void => {
  if (!match.additionalUsageLocations) {
    match.additionalUsageLocations = {};
  }

  if (!match.additionalUsageLocations.taskDependencies) {
    match.additionalUsageLocations.taskDependencies = [];
  }

  match.additionalUsageLocations.taskDependencies.push({
    description: dependency,
    link: "/mgmt/cms#/collections/settings/entries/task-dependencies",
  });
};

const addIndustryDependency = (match: Match, dependency: string, linkEnd: string): void => {
  if (!match.additionalUsageLocations) {
    match.additionalUsageLocations = {};
  }

  if (!match.additionalUsageLocations.industries) {
    match.additionalUsageLocations.industries = [];
  }

  match.additionalUsageLocations.industries.push({
    description: dependency,
    link: `/mgmt/cms#/collections/roadmaps/entries/${linkEnd.toLowerCase()}`,
  });
};

const addAddOnDependency = (match: Match, dependency: string, linkEnd: string): void => {
  if (!match.additionalUsageLocations) {
    match.additionalUsageLocations = {};
  }

  if (!match.additionalUsageLocations.addOns) {
    match.additionalUsageLocations.addOns = [];
  }

  match.additionalUsageLocations.addOns.push({
    description: dependency,
    link: `/mgmt/cms#/collections/addons/entries/${linkEnd.toLowerCase()}`,
  });
};

export const AddTaskDependencyUsage = (matches: Match[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const dependency of TaskDependencies.dependencies) {
      if (match.filename === dependency.task) {
        const addedPhrase = composeHasTaskDependenciesString();

        addTaskDependency(matches[index], addedPhrase);
      }
      if (match.filename === dependency.licenseTask) {
        const addedPhrase = composeHasLicenseTaskDependenciesString();

        addTaskDependency(matches[index], addedPhrase);
      }
      if (dependency.taskDependencies) {
        for (const TaskDependnecy of dependency.taskDependencies) {
          if (match.filename === TaskDependnecy) {
            const addedPhrase = composeIsTaskDependencyTaskString(
              dependency.task ?? dependency.licenseTask ?? "",
            );
            addTaskDependency(matches[index], addedPhrase);
          }
        }
      }
      if (dependency.licenseTaskDependencies) {
        for (const LicenseTaskDependnecy of dependency.licenseTaskDependencies) {
          if (match.filename === LicenseTaskDependnecy) {
            const addedPhrase = composeIsLicenseTaskDependencyString(
              dependency.task ?? dependency.licenseTask ?? "",
            );
            addTaskDependency(matches[index], addedPhrase);
          }
        }
      }
    }
  }
};

export const composeHasTaskDependenciesString = (): string => {
  return `this is a Task which has dependencies`;
};

export const composeHasLicenseTaskDependenciesString = (): string => {
  return `this is a License Task which has dependencies`;
};

export const composeIsTaskDependencyTaskString = (task: string): string => {
  return `this task is a Task dependency for the "${task}" task`;
};

export const composeIsLicenseTaskDependencyString = (licenseTask: string): string => {
  return `this task is a License Task dependency for the "${licenseTask}" task`;
};

export const AddIndustryUsage = (matches: Match[], industries: Industry[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const industry of industries) {
      for (const roadMapStep of industry.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = composeIndstryTaskString(industry.name);

          addIndustryDependency(matches[index], addedPhrase, industry.id);
        }
        if (match.filename === roadMapStep.licenseTask) {
          const addedPhrase = composeIndstryLicenseTaskString(industry.name);

          addIndustryDependency(matches[index], addedPhrase, industry.id);
        }
      }
    }
  }
};

export const composeIndstryTaskString = (name: string): string => {
  return `this Task is used in the "${name}" industry roadmap`;
};

export const composeIndstryLicenseTaskString = (name: string): string => {
  return `this License Task is used in the "${name}" industry roadmap`;
};

export const AddAddOnUsage = (matches: Match[], addOns: IndustryRoadmap[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const addOn of addOns) {
      for (const roadMapStep of addOn.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = composeAddOnTaskString(addOn.id);
          addAddOnDependency(matches[index], addedPhrase, addOn.id);
        }
        if (match.filename === roadMapStep.licenseTask) {
          const addedPhrase = composeAddOnLicenseTaskString(addOn.id);

          addAddOnDependency(matches[index], addedPhrase, addOn.id);
        }
      }
      if (addOn.modifications !== undefined) {
        for (const roadMapStep of addOn.modifications) {
          if (match.filename === roadMapStep.taskToReplaceFilename) {
            const addedPhrase = composeAddOnTaskToReplaceFilenameString(addOn.id);

            addAddOnDependency(matches[index], addedPhrase, addOn.id);
          }
          if (match.filename === roadMapStep.replaceWithFilename) {
            const addedPhrase = composeAddOnReplaceWithFileNameString(addOn.id);

            addAddOnDependency(matches[index], addedPhrase, addOn.id);
          }
        }
      }
    }
  }
};

export const composeAddOnReplaceWithFileNameString = (id: string): string => {
  return `this Task replaces another task "${id}" add-on modification section`;
};
export const composeAddOnTaskToReplaceFilenameString = (id: string): string => {
  return `this Task is replaced with another task "${id}" add-on modification section`;
};
export const composeAddOnTaskString = (id: string): string => {
  return `this Task is used in the "${id}" add-on roadmap`;
};
export const composeAddOnLicenseTaskString = (id: string): string => {
  return `this license task is used in the "${id}" add-on roadmap`;
};
