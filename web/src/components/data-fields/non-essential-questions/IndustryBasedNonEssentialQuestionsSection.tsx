import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import {
  doesIndustryHaveNonEssentialQuestions,
  doesSectorHaveNonEssentialQuestions,
  getPersonaBasedNonEssentialQuestionsIds,
  hasNonEssentialQuestions,
} from "@/lib/utils/non-essential-questions-helpers";
import { LookupIndustryById, LookupSectorTypeById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const IndustryBasedNonEssentialQuestionsSection = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const userHasNonEssentialQuestions: boolean = hasNonEssentialQuestions(state.profileData);

  const getNonEssentialQuestions = (): ReactElement[] => {
    let questionIds: string[] = [];
    if (doesIndustryHaveNonEssentialQuestions(state.profileData)) {
      questionIds = [
        ...questionIds,
        ...LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds,
      ];
    }
    if (doesSectorHaveNonEssentialQuestions(state.profileData)) {
      questionIds = [
        ...questionIds,
        ...LookupSectorTypeById(state.profileData.sectorId).nonEssentialQuestionsIds,
      ];
    }
    questionIds = [...questionIds, ...getPersonaBasedNonEssentialQuestionsIds(state.profileData)];
    // check for duplicate question IDs
    questionIds = [...new Set(questionIds)];
    return assembleNonEssentialQuestions(questionIds);
  };

  const assembleNonEssentialQuestions = (questionIds: string[]): ReactElement[] => {
    const nonEssentialQuestionsArray: ReactElement[] = [];
    for (const question of questionIds) {
      nonEssentialQuestionsArray.push(
        <NonEssentialQuestion key={question} essentialQuestionId={question} />,
      );
    }
    return nonEssentialQuestionsArray;
  };

  return (
    <>
      {userHasNonEssentialQuestions && (
        <div data-testid="non-essential-questions-wrapper">{getNonEssentialQuestions()}</div>
      )}
    </>
  );
};
