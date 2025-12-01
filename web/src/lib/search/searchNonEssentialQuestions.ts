import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { NonEssentialQuestion } from "@businessnjgovnavigator/shared/types";

export const searchNonEssentialQuestions = (
  nonEssentialQuestions: NonEssentialQuestion[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  for (const nonEssentialQuestion of nonEssentialQuestions) {
    let match: Match = {
      filename: "nonEssentialQuestionsArray",
      snippets: [],
    };

    const id = nonEssentialQuestion.id.toLowerCase();
    const questionText = nonEssentialQuestion.questionText.toLowerCase();
    const addOnWhenYes = nonEssentialQuestion.addOnWhenYes?.toLowerCase();
    const addOnWhenNo = nonEssentialQuestion.addOnWhenNo?.toLowerCase();

    const labelledTexts = [
      { content: id, label: "ID" },
      { content: questionText, label: "Question" },
      { content: addOnWhenYes, label: "Yes Add On" },
      { content: addOnWhenNo, label: "No Add On" },
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.displayTitle = `Non Essential Questions (question ${nonEssentialQuestion.id})`;
      matches.push(match);
    }
  }

  return matches;
};
