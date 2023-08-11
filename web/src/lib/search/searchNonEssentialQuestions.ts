import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { NonEssentialQuestion } from "@/lib/types/types";

export const searchNonEssentialQuestions = (
  nonEssentialQuestions: NonEssentialQuestion[],
  term: string
): Match[] => {
  const matches: Match[] = [];

  for (const nonEssentialQuestion of nonEssentialQuestions) {
    let match: Match = {
      filename: "Non Essential Questions",
      snippets: [],
    };

    const id = nonEssentialQuestion.id.toLowerCase();
    const questionText = nonEssentialQuestion.questionText.toLowerCase();
    const addOn = nonEssentialQuestion.addOn.toLowerCase();

    const labelledTexts = [
      { content: id, label: "ID" },
      { content: questionText, label: "Question" },
      { content: addOn, label: "Add On" },
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.filename = `${match.filename} (question ${nonEssentialQuestion.id})`;
      matches.push(match);
    }
  }

  return matches;
};
