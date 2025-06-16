import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { NonEssentialQuestionForPersonas } from "@/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import {
  doesIndustryHaveNonEssentialQuestions,
  getPersonaBasedNonEssentialQuestionsIds,
} from "@/lib/utils/non-essential-questions-helpers";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const IndustryBasedNonEssentialQuestionsSection = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);

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
      {doesIndustryHaveNonEssentialQuestions(state.profileData) && (
        <div data-testid="non-essential-questions-wrapper">{nonEssentialQuestions()}</div>
      )}
      {getPersonaBasedNonEssentialQuestionsIds(state.profileData).map((questionId) => {
        return <NonEssentialQuestionForPersonas questionId={questionId} key={questionId} />;
      })}
    </>
  );
};
