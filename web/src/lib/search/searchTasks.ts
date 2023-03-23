import { Match } from "@/lib/search/typesForSearch";
import { Task } from "@/lib/types/types";

export const searchTasks = (tasks: Task[], term: string) => {
  const matches: Match[] = [];

  for (const task of tasks) {
    const match: Match = {
      filename: task.filename,
      snippets: [],
    };

    const content = task.contentMd.toLowerCase();
    const name = task.name.toLowerCase();
    const cta = task.callToActionText?.toLowerCase();
    const agency = task.issuingAgency?.toLowerCase();
    const formName = task.formName?.toLowerCase();

    if (content.includes(term)) {
      const index = content.indexOf(term);
      const startIndex = index - 50 < 0 ? 0 : index - 50;
      const endIndex = term.length + index + 50;
      match.snippets.push(content.slice(startIndex, endIndex));
    }

    if (cta?.includes(term)) {
      match.snippets.push(`CTA Text: ${cta}`);
    }

    if (name.includes(term)) {
      match.snippets.push(`Task name: ${name}`);
    }

    if (agency?.includes(term)) {
      match.snippets.push(`Agency: ${agency}`);
    }

    if (formName?.includes(term)) {
      match.snippets.push(`Form Name: ${formName}`);
    }

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
