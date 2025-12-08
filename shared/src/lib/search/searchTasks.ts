import { Match } from "./typesForSearch";

import {
  AddAddOnUsage,
  AddIndustryUsage,
  AddTaskDependencyUsage,
} from "src/lib/search/usageHelpers";
import { Industry } from "../../industry";
import { LookupTaskAgencyById } from "../../taskAgency";
import { IndustryRoadmap, Task } from "../../types";
import { findMatchInBlock, findMatchInLabelledText } from "./helpers";

export const searchTasks = (
  tasks: Task[],
  term: string,
  industries: Industry[],
  addOns: IndustryRoadmap[],
): Match[] => {
  const matches: Match[] = [];

  for (const task of tasks) {
    let match: Match = {
      filename: task.filename,
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

  // for DEBUGGING, uncomment before the end
  AddAddOnUsage(matches, addOns);
  AddIndustryUsage(matches, industries);
  AddTaskDependencyUsage(matches);

  return matches;
};
