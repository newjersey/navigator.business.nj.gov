import { NonEssentialQuestion } from "../../types";
import { findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchNonEssentialQuestions = (
  nonEssentialQuestions: NonEssentialQuestion[],
  term: string,
): Match[] => {
  const matches: Match[] = [];

  const questionData = getNonEssentialQuestionData(nonEssentialQuestions);

  for (const questionDataItem of questionData) {
    let match: Match = {
      filename: "nonEssentialQuestionsArray",
      snippets: [],
    };

    match = findMatchInLabelledText(questionDataItem.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.displayTitle = `Non Essential Questions (question ${questionDataItem.fileName})`;
      matches.push(match);
    }
  }

  return matches;
};

export const getNonEssentialQuestionData = (
  nonEssentialQuestions: NonEssentialQuestion[],
): FileData[] => {
  const questionData: FileData[] = [];

  for (const nonEssentialQuestion of nonEssentialQuestions) {
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

    questionData.push({
      fileName: nonEssentialQuestion.id,
      labelledTexts,
      blockTexts: [], // No blockTexts needed for non-essential questions
      listTexts: [], // No listTexts needed for non-essential questions
    });
  }

  return questionData;
};
