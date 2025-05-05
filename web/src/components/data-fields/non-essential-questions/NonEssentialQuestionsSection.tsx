import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const NonEssentialQuestionsSection = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const doesIndustryHaveNonEssentialQuestions = (): boolean => {
    return LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds.length > 0;
  };

  const nonEssentialQuestions = (): ReactElement[] => {
    const nonEssentialQuestionsArray: ReactElement[] = [];
    const questionIds = LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds;
    for (const question of questionIds) {
      nonEssentialQuestionsArray.push(
        <NonEssentialQuestion key={question} essentialQuestionId={question} />,
      );
    }

    return nonEssentialQuestionsArray;
  };

  return (
    <>
      {doesIndustryHaveNonEssentialQuestions() && (
        <div data-testid="non-essential-questions-wrapper">{nonEssentialQuestions()}</div>
      )}
    </>
  );
};
