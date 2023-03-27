import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { Task } from "@/lib/types/types";

export const searchTasks = (tasks: Task[], term: string) => {
  const matches: Match[] = [];

  for (const task of tasks) {
    let match: Match = {
      filename: task.filename,
      snippets: [],
    };

    const content = task.contentMd.toLowerCase();
    const name = task.name.toLowerCase();
    const cta = task.callToActionText?.toLowerCase();
    const agency = task.issuingAgency?.toLowerCase();
    const formName = task.formName?.toLowerCase();

    const blockTexts = [content];
    const labelledTexts = [
      { content: cta, label: "CTA Text" },
      { content: name, label: "Task name" },
      { content: agency, label: "Agency" },
      { content: formName, label: "Form Name" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
