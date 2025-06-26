import { IndustryRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Task } from "@/lib/types/types";
import TaskDependencies from "@businessnjgovnavigator/content/roadmaps/task-dependencies.json";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import { LookupTaskAgencyById } from "@businessnjgovnavigator/shared/taskAgency";

export const searchTasks = (
  tasks: Task[],
  term: string,
  cmsCollectionName: string,
  industries: Industry[],
  addOns: IndustryRoadmap[],
): Match[] => {
  const matches: Match[] = [];
  console.log(addOns);

  for (const task of tasks) {
    let match: Match = {
      filename: task.filename,
      cmsCollectionName: cmsCollectionName,
      snippets: [],
    };

    const content = task.contentMd?.toLowerCase();
    const name = task.name?.toLowerCase();
    const cta = task.callToActionText?.toLowerCase();
    const ctaLink = task.callToActionLink?.toLowerCase();
    const agency = task.agencyId ? LookupTaskAgencyById(task.agencyId).name?.toLowerCase() : "";
    const agencyContext = task.agencyAdditionalContext?.toLowerCase();
    const formName = task.formName?.toLowerCase();
    const summary = task.summaryDescriptionMd?.toLowerCase();
    const filename = task.filename?.toLowerCase();
    const urlSlug = task.urlSlug?.toLowerCase();

    const blockTexts = [content, summary];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: ctaLink, label: "CTA Link" },
      { content: name, label: "Task name" },
      { content: agency, label: "Agency" },
      { content: agencyContext, label: "Agency Additional Context" },
      { content: formName, label: "Form Name" },
      { content: filename, label: "Filename" },
      { content: urlSlug, label: "Url Slug" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  const addTaskDependency = (match: Match, dependency: string): void => {
    if (!match.additionalUsageLocations) {
      match.additionalUsageLocations = {};
    }

    if (!match.additionalUsageLocations.taskDependencies) {
      match.additionalUsageLocations.taskDependencies = [];
    }

    match.additionalUsageLocations.taskDependencies.push(dependency);
  };

  const addIndustryDependency = (match: Match, dependency: string): void => {
    if (!match.additionalUsageLocations) {
      match.additionalUsageLocations = {};
    }

    if (!match.additionalUsageLocations.industries) {
      match.additionalUsageLocations.industries = [];
    }

    match.additionalUsageLocations.industries.push(dependency);
  };

  const addAddOnDependency = (match: Match, dependency: string): void => {
    if (!match.additionalUsageLocations) {
      match.additionalUsageLocations = {};
    }

    if (!match.additionalUsageLocations.addOns) {
      match.additionalUsageLocations.addOns = [];
    }

    match.additionalUsageLocations.addOns.push(dependency);
  };

  /*
  // here, before we send matches back?
  // We should look in the other places to see if there are other relevant details and then add them to the match?
  So what I want to do is as follows.

  I want to add an optional param to match, which has what I would call essentially extra match data

  in our case this would be an array of objects that have a link text, and maybe some indication text for where other usage is

  we also need to modify this searchTasks to grab id and then make some functions to search through the corresponding locations and find matches and
  grab the corresponding usage and make a link to the relevant parts accordingly

  */

  // I should probably make this a function eventually and import and use here rather than inling this
  for (const [index, match] of matches.entries()) {
    for (const dependency of TaskDependencies.dependencies) {
      if (match.filename === dependency.task) {
        const addedPhrase = `this is a task which has dependencies`;

        addTaskDependency(matches[index], addedPhrase);
      }
      if (dependency.taskDependencies) {
        for (const TaskDependnecy of dependency.taskDependencies) {
          if (match.filename === TaskDependnecy) {
            const addedPhrase = `this task is a dependency for the "${dependency.task}" task`;
            addTaskDependency(matches[index], addedPhrase);
          }
        }
      }
    }
  }

  // industries
  for (const [index, match] of matches.entries()) {
    for (const industry of industries) {
      for (const roadMapStep of industry.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = `this is used in the "${industry.name}" industry roadmap `;

          addIndustryDependency(matches[index], addedPhrase);
        }
      }
    }
  }

  // addon's
  for (const [index, match] of matches.entries()) {
    for (const addOn of addOns) {
      for (const roadMapStep of addOn.roadmapSteps) {
        if (match.filename === roadMapStep.task) {
          const addedPhrase = `this is used in the "${addOn.id}" add-on roadmap `;

          addAddOnDependency(matches[index], addedPhrase);
        }
        // should probably have a case for modifications section too
      }
    }
  }

  return matches;
};
