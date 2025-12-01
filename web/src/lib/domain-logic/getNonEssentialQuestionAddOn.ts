import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";
import { NonEssentialQuestion } from "@businessnjgovnavigator/shared/types";

const getNonEssentialQuestion = (essentialQuestionId: string): NonEssentialQuestion | undefined => {
  return NonEssentialQuestions.nonEssentialQuestionsArray.find(
    (questionObj) => questionObj.id === essentialQuestionId,
  );
};

export const getNonEssentialQuestionAddOnWhenYes = (
  essentialQuestionId: string,
): string | undefined => {
  return getNonEssentialQuestion(essentialQuestionId)?.addOnWhenYes;
};

export const getNonEssentialQuestionAddOnWhenNo = (
  essentialQuestionId: string,
): string | undefined => {
  return getNonEssentialQuestion(essentialQuestionId)?.addOnWhenNo;
};
