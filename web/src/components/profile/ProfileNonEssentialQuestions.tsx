import { ProfileNonEssentialQuestion } from "@/components/profile/ProfileNonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ProfileNonEssentialQuestions = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const doesIndustryHaveNonEssentialQuestions = (): boolean => {
    return LookupIndustryById(state.profileData.industryId).nonEssentialQuestions.length > 0;
  };

  const nonEssentialQuestions = (): ReactElement[] => {
    const nonEssentialQuestionsArray: ReactElement[] = [];
    if (state?.profileData.nonEssentialQuestions) {
      for (const question in state.profileData.nonEssentialQuestions) {
        nonEssentialQuestionsArray.push(<ProfileNonEssentialQuestion essentialQuestionId={question} />);
      }
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
