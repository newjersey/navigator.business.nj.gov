import { Industry } from "../../industry";
import {
  AddAddOnUsage,
  AddIndustryUsage,
  AddTaskDependencyUsage,
} from "../../lib/search/usageHelpers";
import { LookupTaskAgencyById } from "../../taskAgency";
import { IndustryRoadmap, Task } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchTasks = (
  tasks: Task[],
  term: string,
  industries: Industry[],
  addOns: IndustryRoadmap[],
): Match[] => {
  const matches: Match[] = [];

  const taskData = getTaskData(tasks);

  for (const taskDataItem of taskData) {
    let match: Match = {
      filename: taskDataItem.fileName,
      snippets: [],
    };

    match = findMatchInBlock(taskDataItem.blockTexts, term, match);
    match = findMatchInLabelledText(taskDataItem.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  AddAddOnUsage(matches, addOns);
  AddIndustryUsage(matches, industries);
  AddTaskDependencyUsage(matches);

  return matches;
};

export const getTaskData = (tasks: Task[]): FileData[] => {
  const taskData: FileData[] = [];

  for (const task of tasks) {
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

    taskData.push({
      fileName: task.filename,
      labelledTexts,
      blockTexts,
      listTexts: [], // No listTexts needed for tasks
    });
  }

  return taskData;
};
