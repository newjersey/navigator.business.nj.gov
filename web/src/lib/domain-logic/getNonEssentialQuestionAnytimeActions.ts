import NonEssentialQuestions from "@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json";

export const getNonEssentialQuestionAnytimeActions = (nonEssentialQuestionId: string): string[] => {
  return (
    NonEssentialQuestions.nonEssentialQuestionsArray.find((questionObj) => {
      return questionObj.id === nonEssentialQuestionId;
    })?.anytimeActions ?? []
  );
};
