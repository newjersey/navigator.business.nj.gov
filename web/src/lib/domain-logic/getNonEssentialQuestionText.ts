import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";

export const getNonEssentialQuestionText = (essentialQuestionId: string): string | undefined => {
  return NonEssentialQuestions.nonEssentialQuestionsArray.find(
    (questionObj) => questionObj.id === essentialQuestionId
  )?.questionText;
};
