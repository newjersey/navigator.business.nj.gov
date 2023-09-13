import { ProfileNonEssentialQuestion } from "@/components/profile/ProfileNonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ProfileNonEssentialQuestionsSection = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const doesIndustryHaveNonEssentialQuestions = (): boolean => {
    return LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds.length > 0;
  };

  const nonEssentialQuestions = (): ReactElement[] => {
    const nonEssentialQuestionsArray: ReactElement[] = [];
    const questionIds = LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds;
    for (const question of questionIds) {
      nonEssentialQuestionsArray.push(
        <ProfileNonEssentialQuestion key={question} essentialQuestionId={question} />
      );
    }

    return nonEssentialQuestionsArray;
  };

  return (
    <>
      {doesIndustryHaveNonEssentialQuestions() && (
        <>
          <div className={"margin-top-3"}>
            {Config.profileDefaults.fields.nonEssentialQuestions.default.header}
          </div>
          {nonEssentialQuestions()}
        </>
      )}
    </>
  );
};
