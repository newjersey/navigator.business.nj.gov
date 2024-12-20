import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const NonEssentialQuestionsSection = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const doesIndustryHaveNonEssentialQuestions = (): boolean => {
    return LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds.length > 0;
  };

  const nonEssentialQuestions = (): ReactElement<any>[] => {
    const nonEssentialQuestionsArray: ReactElement<any>[] = [];
    const questionIds = LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds;
    for (const question of questionIds) {
      nonEssentialQuestionsArray.push(<NonEssentialQuestion key={question} essentialQuestionId={question} />);
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
