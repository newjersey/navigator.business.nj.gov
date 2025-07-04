import { IndustryRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Match } from "@/lib/search/typesForSearch";
import TaskDependencies from "@businessnjgovnavigator/content/roadmaps/task-dependencies.json";
import { Industry } from "@businessnjgovnavigator/shared/industry";

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
    link: `/mgmt/cms#/collections/roadmaps/entries/${linkEnd}`,
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
    link: `/mgmt/cms#/collections/addons/entries/${linkEnd}`,
  });
};

export const AddTaskDependencyUsage = (matches: Match[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const dependency of TaskDependencies.dependencies) {
      if (match.filename === dependency.task) {
        const addedPhrase = `this is a Task which has dependencies`;

        addTaskDependency(matches[index], addedPhrase);
      }
      if (dependency.taskDependencies) {
        for (const TaskDependnecy of dependency.taskDependencies) {
          if (match.filename === TaskDependnecy) {
            const addedPhrase = `this task is a Task dependency for the "${
              dependency.task ?? dependency.licenseTask
            }" task`;
            addTaskDependency(matches[index], addedPhrase);
          }
        }
      }
      if (dependency.licenseTaskDependencies) {
        for (const LicenseTaskDependnecy of dependency.licenseTaskDependencies) {
          if (match.filename === LicenseTaskDependnecy) {
            const addedPhrase = `this task is a License Task dependency for the "${
              dependency.task ?? dependency.licenseTask
            }" task`;
            addTaskDependency(matches[index], addedPhrase);
          }
        }
      }
    }
  }
};

export const AddIndustryUsage = (matches: Match[], industries: Industry[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const industry of industries) {
      for (const roadMapStep of industry.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = `this Task is used in the "${industry.name}" industry roadmap `;

          addIndustryDependency(matches[index], addedPhrase, industry.name);
        }
        if (match.filename === roadMapStep.licenseTask) {
          const addedPhrase = `this License Task is used in the "${industry.name}" industry roadmap `;

          addIndustryDependency(matches[index], addedPhrase, industry.name);
        }
      }
    }
  }
};

export const AddAddOnUsage = (matches: Match[], addOns: IndustryRoadmap[]): void => {
  for (const [index, match] of matches.entries()) {
    for (const addOn of addOns) {
      for (const roadMapStep of addOn.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = `this Task is used in the "${addOn.id}" add-on roadmap `;
          addAddOnDependency(matches[index], addedPhrase, addOn.id);
        }
        if (match.filename === roadMapStep.licenseTask) {
          const addedPhrase = `this license task is used in the "${addOn.id}" add-on roadmap `;

          addAddOnDependency(matches[index], addedPhrase, addOn.id);
        }
      }
      if (addOn.modifications !== undefined) {
        for (const roadMapStep of addOn.modifications) {
          if (match.filename === roadMapStep.taskToReplaceFilename) {
            const addedPhrase = `this Task is replaced with another task "${addOn.id}" add-on modification section `;

            addAddOnDependency(matches[index], addedPhrase, addOn.id);
          }
          if (match.filename === roadMapStep.replaceWithFilename) {
            const addedPhrase = `this Task replaces another task "${addOn.id}" add-on modification section  `;

            addAddOnDependency(matches[index], addedPhrase, addOn.id);
          }
        }
      }
    }
  }
};
